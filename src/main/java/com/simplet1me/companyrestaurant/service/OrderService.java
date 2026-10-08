package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.model.dto.OrderCreateDTO;
import com.simplet1me.companyrestaurant.model.vo.BlanketOrderVO;
import com.simplet1me.companyrestaurant.model.vo.DeliveryVO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.model.vo.OrderStatusVO;
import com.simplet1me.companyrestaurant.model.vo.OrderVO;

import java.time.LocalDate;

/**
 * 订餐与订单服务
 */
public interface OrderService {

    /** 当前订餐状态（时间窗口判定） */
    OrderStatusVO getStatus();

    /** 下单：时间窗口判定 + 每日一单校验 + 菜单快照写入 */
    OrderVO create(OrderCreateDTO dto, LoginUserVO loginUser);

    /** 我的订单 */
    PageResult<OrderVO> mine(Long userId, LocalDate mealDate, int pageNum, int pageSize);

    /** 按用餐日期查询全部订单（经理/配餐员） */
    PageResult<OrderVO> pageList(LocalDate mealDate, int pageNum, int pageSize);

    /** 订单详情（员工仅能查看自己的） */
    OrderVO getDetail(Long id, LoginUserVO loginUser);

    /** 经理删除订单（物理删除，员工可重新下单） */
    void delete(Long id);

    /** 总括订单（厨房主管备料汇总） */
    BlanketOrderVO blanket(LocalDate mealDate);

    /** 配餐批量订单（配餐员配送用） */
    DeliveryVO delivery(LocalDate mealDate);
}
