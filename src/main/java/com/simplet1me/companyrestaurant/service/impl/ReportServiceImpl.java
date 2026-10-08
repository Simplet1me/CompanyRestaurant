package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.entity.Order;
import com.simplet1me.companyrestaurant.entity.OrderItem;
import com.simplet1me.companyrestaurant.entity.User;
import com.simplet1me.companyrestaurant.mapper.OrderItemMapper;
import com.simplet1me.companyrestaurant.mapper.OrderMapper;
import com.simplet1me.companyrestaurant.mapper.UserMapper;
import com.simplet1me.companyrestaurant.model.vo.EmployeeReportVO;
import com.simplet1me.companyrestaurant.model.vo.MineMonthlyReportVO;
import com.simplet1me.companyrestaurant.model.vo.MonthlyReportVO;
import com.simplet1me.companyrestaurant.model.vo.OrderItemVO;
import com.simplet1me.companyrestaurant.model.vo.OrderVO;
import com.simplet1me.companyrestaurant.model.vo.ReportItemVO;
import com.simplet1me.companyrestaurant.model.vo.UserVO;
import com.simplet1me.companyrestaurant.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 统计报表服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderMapper orderMapper;

    private final OrderItemMapper orderItemMapper;

    private final UserMapper userMapper;

    @Override
    public MonthlyReportVO monthly(String month) {
        LocalDate[] range = parseMonthRange(month);
        MonthlyReportVO vo = new MonthlyReportVO();
        vo.setMonth(month);
        List<ReportItemVO> items = orderItemMapper.sumGroupBy(null, range[0], range[1]);
        items.forEach(this::fillAvgPrice);
        vo.setItems(items);
        vo.setTotalAmount(items.stream().map(ReportItemVO::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return vo;
    }

    @Override
    public EmployeeReportVO employeeMonthly(Long userId, String month) {
        User user = requireUser(userId);
        LocalDate[] range = parseMonthRange(month);
        EmployeeReportVO vo = new EmployeeReportVO();
        vo.setMonth(month);
        vo.setEmployee(toUserVO(user));
        List<Order> orders = orderMapper.findByMealDateRange(userId, range[0], range[1]).stream()
                .filter(o -> Order.STATUS_VALID.equals(o.getStatus()))
                .toList();
        vo.setOrders(assembleOrders(orders));
        vo.setMonthTotalAmount(orders.stream().map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return vo;
    }

    @Override
    public MineMonthlyReportVO mineMonthly(Long userId, String month) {
        User user = requireUser(userId);
        LocalDate[] range = parseMonthRange(month);
        MineMonthlyReportVO vo = new MineMonthlyReportVO();
        vo.setMonth(month);
        vo.setEmployee(toUserVO(user));
        List<ReportItemVO> items = orderItemMapper.sumGroupBy(userId, range[0], range[1]);
        items.forEach(this::fillAvgPrice);
        vo.setItems(items);
        vo.setTotalAmount(items.stream().map(ReportItemVO::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return vo;
    }

    @Override
    public EmployeeReportVO mineOrders(Long userId, String month) {
        return employeeMonthly(userId, month);
    }

    /** 加权平均单价 = 金额合计 ÷ 分量合计 */
    private void fillAvgPrice(ReportItemVO item) {
        if (item.getTotalQty() != null && item.getTotalQty() > 0 && item.getTotalAmount() != null) {
            item.setAvgPrice(item.getTotalAmount()
                    .divide(BigDecimal.valueOf(item.getTotalQty()), 2, RoundingMode.HALF_UP));
        } else {
            item.setAvgPrice(BigDecimal.ZERO);
        }
    }

    /** 批量装配订单明细 */
    private List<OrderVO> assembleOrders(List<Order> orders) {
        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        if (orderIds.isEmpty()) {
            return List.of();
        }
        Map<Long, List<OrderItem>> itemsByOrderId = orderItemMapper.findByOrderIds(orderIds).stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
        return orders.stream().map(order -> {
            OrderVO vo = new OrderVO();
            vo.setId(order.getId());
            vo.setMealDate(order.getMealDate());
            vo.setStatus(order.getStatus());
            vo.setEmpName(order.getEmpName());
            vo.setPhone(order.getPhone());
            vo.setWorkstation(order.getWorkstation());
            vo.setCreateTime(order.getCreateTime());
            vo.setTotalPrice(order.getTotalPrice());
            vo.setItems(itemsByOrderId.getOrDefault(order.getId(), List.of()).stream().map(item -> {
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
        }).toList();
    }

    private LocalDate[] parseMonthRange(String month) {
        try {
            YearMonth ym = YearMonth.parse(month);
            return new LocalDate[]{ym.atDay(1), ym.atEndOfMonth()};
        } catch (DateTimeParseException e) {
            throw new BusinessException("月份格式非法，应为 yyyy-MM");
        }
    }

    private User requireUser(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    private UserVO toUserVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setLoginName(user.getLoginName());
        vo.setRole(user.getRole());
        vo.setPhone(user.getPhone());
        vo.setDepartment(user.getDepartment());
        vo.setWorkstation(user.getWorkstation());
        vo.setCreateTime(user.getCreateTime());
        return vo;
    }
}
