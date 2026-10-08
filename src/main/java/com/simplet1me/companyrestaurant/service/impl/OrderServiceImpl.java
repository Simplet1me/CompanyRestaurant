package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.entity.Menu;
import com.simplet1me.companyrestaurant.entity.MenuItem;
import com.simplet1me.companyrestaurant.entity.Order;
import com.simplet1me.companyrestaurant.entity.OrderItem;
import com.simplet1me.companyrestaurant.mapper.MenuItemMapper;
import com.simplet1me.companyrestaurant.mapper.MenuMapper;
import com.simplet1me.companyrestaurant.mapper.OrderItemMapper;
import com.simplet1me.companyrestaurant.mapper.OrderMapper;
import com.simplet1me.companyrestaurant.model.dto.OrderCreateDTO;
import com.simplet1me.companyrestaurant.model.dto.OrderItemDTO;
import com.simplet1me.companyrestaurant.model.vo.BlanketOrderVO;
import com.simplet1me.companyrestaurant.model.vo.DeliveryVO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.model.vo.OrderItemVO;
import com.simplet1me.companyrestaurant.model.vo.OrderStatusVO;
import com.simplet1me.companyrestaurant.model.vo.OrderVO;
import com.simplet1me.companyrestaurant.service.ConfigService;
import com.simplet1me.companyrestaurant.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 订餐与订单服务实现。
 * 核心规则：订餐时间窗口（截止 09:00 前订当天 / 配餐开始 11:30 后订次日）、
 * 每员工每用餐日一张订单、订单明细为菜单快照（改价/换菜单不影响已下单）。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;

    private final OrderItemMapper orderItemMapper;

    private final MenuMapper menuMapper;

    private final MenuItemMapper menuItemMapper;

    private final ConfigService configService;

    @Override
    public OrderStatusVO getStatus() {
        LocalTime now = LocalTime.now();
        LocalTime deadline = configService.getOrderDeadline();
        LocalTime serveStart = configService.getServeStartTime();

        OrderStatusVO vo = new OrderStatusVO();
        vo.setDeadline(deadline.toString());
        vo.setServeStartTime(serveStart.toString());

        if (now.isBefore(deadline)) {
            vo.setCanOrder(true);
            vo.setMealDate(LocalDate.now());
        } else if (!now.isBefore(serveStart)) {
            vo.setCanOrder(true);
            vo.setMealDate(LocalDate.now().plusDays(1));
        } else {
            vo.setCanOrder(false);
            vo.setReason("已过订餐截止时间，次日订餐尚未开始");
        }
        return vo;
    }

    /** 计算当前可订的用餐日期；不在窗口内时抛出业务异常 */
    private LocalDate resolveMealDate() {
        OrderStatusVO status = getStatus();
        if (!Boolean.TRUE.equals(status.getCanOrder())) {
            throw new BusinessException("当前不在订餐时间窗口内：" + status.getReason());
        }
        return status.getMealDate();
    }

    @Override
    @Transactional
    public OrderVO create(OrderCreateDTO dto, LoginUserVO loginUser) {
        LocalDate mealDate = resolveMealDate();

        // 每个员工每个用餐日期只生成一张订单
        if (orderMapper.findByUserIdAndMealDate(loginUser.getId(), mealDate) != null) {
            throw new BusinessException("该用餐日期已下过单");
        }

        // 菜品必须来自当前使用中菜单
        Menu currentMenu = menuMapper.findByStatus(Menu.STATUS_USE);
        if (currentMenu == null) {
            throw new BusinessException("当前没有使用中的菜单");
        }
        List<MenuItem> menuItems = menuItemMapper.findByMenuId(currentMenu.getId());
        Map<Long, MenuItem> menuItemMap = menuItems.stream()
                .collect(Collectors.toMap(MenuItem::getId, Function.identity()));

        // 先构建明细（校验菜单项，快照复制），再算总价，最后落库
        List<OrderItem> items = dto.getItems().stream().map(itemDTO -> {
            MenuItem menuItem = menuItemMap.get(itemDTO.getMenuItemId());
            if (menuItem == null) {
                throw new BusinessException("菜单项不属于当前使用中菜单: menuItemId=" + itemDTO.getMenuItemId());
            }
            OrderItem item = new OrderItem();
            item.setMenuItemId(menuItem.getId());
            item.setName(menuItem.getName());
            item.setUnit(menuItem.getUnit());
            item.setPrice(menuItem.getPrice());
            item.setQty(itemDTO.getQty());
            item.setAmount(menuItem.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQty())));
            return item;
        }).toList();
        BigDecimal totalPrice = items.stream().map(OrderItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setUserId(loginUser.getId());
        order.setEmpName(loginUser.getName());
        order.setPhone(loginUser.getPhone());
        order.setWorkstation(loginUser.getWorkstation());
        order.setMealDate(mealDate);
        order.setStatus(Order.STATUS_VALID);
        order.setTotalPrice(totalPrice);
        orderMapper.insert(order);

        items.forEach(item -> item.setOrderId(order.getId()));
        orderItemMapper.insertBatch(items);

        log.info("下单成功: userId={}, mealDate={}, totalPrice={}", loginUser.getId(), mealDate, totalPrice);
        return toVO(order);
    }

    @Override
    public PageResult<OrderVO> mine(Long userId, LocalDate mealDate, int pageNum, int pageSize) {
        pageNum = Math.max(pageNum, 1);
        pageSize = Math.min(Math.max(pageSize, 1), 100);
        int offset = (pageNum - 1) * pageSize;
        long total = orderMapper.countByCond(userId, mealDate);
        List<OrderVO> list = orderMapper.pageList(userId, mealDate, offset, pageSize).stream()
                .map(this::toVO).toList();
        return PageResult.of(total, list);
    }

    @Override
    public PageResult<OrderVO> pageList(LocalDate mealDate, int pageNum, int pageSize) {
        // 未指定用餐日期时默认取"最近一个可订用餐日期"
        LocalDate targetDate = mealDate != null ? mealDate : getStatus().getMealDate();
        return mine(null, targetDate, pageNum, pageSize);
    }

    @Override
    public OrderVO getDetail(Long id, LoginUserVO loginUser) {
        Order order = requireOrder(id);
        // 普通员工仅能查看自己的订单；经理/配餐员可查看任意
        if (!order.getUserId().equals(loginUser.getId())
                && !"MANAGER".equals(loginUser.getRole())
                && !"DELIVERER".equals(loginUser.getRole())) {
            throw new BusinessException("无权查看该订单");
        }
        return toVO(order);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Order order = requireOrder(id);
        orderItemMapper.deleteByOrderId(id);
        orderMapper.deleteById(id);
        log.info("经理删除订单: orderId={}, userId={}, mealDate={}", id, order.getUserId(), order.getMealDate());
    }

    @Override
    public BlanketOrderVO blanket(LocalDate mealDate) {
        LocalDate targetDate = mealDate != null ? mealDate : getStatus().getMealDate();
        BlanketOrderVO vo = new BlanketOrderVO();
        vo.setMealDate(targetDate);
        vo.setItems(orderItemMapper.sumGroupBy(null, targetDate, targetDate));
        vo.setTotalEmployeeCount(orderMapper.findByMealDate(targetDate).stream()
                .filter(o -> Order.STATUS_VALID.equals(o.getStatus()))
                .map(Order::getUserId).distinct().count());
        return vo;
    }

    @Override
    public DeliveryVO delivery(LocalDate mealDate) {
        LocalDate targetDate = mealDate != null ? mealDate : getStatus().getMealDate();
        DeliveryVO vo = new DeliveryVO();
        vo.setMealDate(targetDate);
        vo.setOrders(orderMapper.findByMealDate(targetDate).stream()
                .filter(o -> Order.STATUS_VALID.equals(o.getStatus()))
                .map(this::toVO).toList());
        return vo;
    }

    private Order requireOrder(Long id) {
        Order order = orderMapper.findById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        return order;
    }

    private OrderVO toVO(Order order) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setMealDate(order.getMealDate());
        vo.setStatus(order.getStatus());
        vo.setEmpName(order.getEmpName());
        vo.setPhone(order.getPhone());
        vo.setWorkstation(order.getWorkstation());
        vo.setCreateTime(order.getCreateTime());
        vo.setTotalPrice(order.getTotalPrice());
        vo.setItems(orderItemMapper.findByOrderId(order.getId()).stream().map(item -> {
            OrderItemVO itemVO = new OrderItemVO();
            itemVO.setId(item.getId());
            itemVO.setName(item.getName());
            itemVO.setUnit(item.getUnit());
            itemVO.setPrice(item.getPrice());
            itemVO.setQty(item.getQty());
            itemVO.setAmount(item.getAmount());
            return itemVO;
        }).toList());
        return vo;
    }
}
