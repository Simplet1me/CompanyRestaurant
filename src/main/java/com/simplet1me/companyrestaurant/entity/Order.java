package com.simplet1me.companyrestaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 订单实体，对应表 orders
 */
@Data
public class Order {

    public static final String STATUS_VALID = "VALID";
    public static final String STATUS_CANCELLED = "CANCELLED";

    /** 订单 id */
    private Long id;

    /** 下单用户 id */
    private Long userId;

    /** 员工姓名（下单时快照） */
    private String empName;

    /** 联系电话（下单时快照，送餐用） */
    private String phone;

    /** 工位信息（下单时快照，送餐用） */
    private String workstation;

    /** 用餐日期（决定每天一单的唯一性） */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mealDate;

    /** 状态：VALID 有效 / CANCELLED 已取消 */
    private String status;

    /** 总计价格（元） */
    private BigDecimal totalPrice;

    /** 下单时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
