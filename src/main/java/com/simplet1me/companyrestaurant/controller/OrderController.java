package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.dto.OrderCreateDTO;
import com.simplet1me.companyrestaurant.model.vo.BlanketOrderVO;
import com.simplet1me.companyrestaurant.model.vo.DeliveryVO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.model.vo.OrderStatusVO;
import com.simplet1me.companyrestaurant.model.vo.OrderVO;
import com.simplet1me.companyrestaurant.service.OrderService;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * 订餐与订单接口。
 * 下单：任何角色；订单查询：登录即可（仅自己的）；经理/配餐员可查全部；
 * 删单：经理；总括订单：厨房主管；配餐批量：配餐员。
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** 当前订餐状态 */
    @GetMapping("/status")
    public Result<OrderStatusVO> status() {
        return Result.success(orderService.getStatus());
    }

    /** 下单（用餐日期由服务端按时间窗口计算） */
    @PostMapping
    public Result<OrderVO> create(@Valid @RequestBody OrderCreateDTO dto, HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        return Result.success(orderService.create(dto, loginUser));
    }

    /** 我的订单 */
    @GetMapping("/mine")
    public Result<PageResult<OrderVO>> mine(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate mealDate,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        return Result.success(orderService.mine(loginUser.getId(), mealDate, pageNum, pageSize));
    }

    /** 订单查询（按用餐日期，经理/配餐员用） */
    @GetMapping
    @RequireRole({Role.MANAGER, Role.DELIVERER})
    public Result<PageResult<OrderVO>> pageList(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate mealDate,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "100") int pageSize) {
        return Result.success(orderService.pageList(mealDate, pageNum, pageSize));
    }

    /** 订单详情（员工仅自己的；经理/配餐员任意） */
    @GetMapping("/{id}")
    public Result<OrderVO> getDetail(@PathVariable Long id, HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        return Result.success(orderService.getDetail(id, loginUser));
    }

    /** 删除（取消）订单（经理） */
    @DeleteMapping("/{id}")
    @RequireRole(Role.MANAGER)
    public Result<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return Result.success();
    }

    /** 总括订单（厨房主管备料汇总） */
    @GetMapping("/blanket")
    @RequireRole({Role.CHEF, Role.MANAGER})
    public Result<BlanketOrderVO> blanket(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate mealDate) {
        return Result.success(orderService.blanket(mealDate));
    }

    /** 配餐订单批量查询（配餐员配送用） */
    @GetMapping("/delivery")
    @RequireRole({Role.DELIVERER, Role.MANAGER})
    public Result<DeliveryVO> delivery(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate mealDate) {
        return Result.success(orderService.delivery(mealDate));
    }
}
