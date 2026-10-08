package com.simplet1me.companyrestaurant.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单视图（含明细）
 */
@Data
public class OrderVO {

    private Long id;

    /** 用餐日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mealDate;

    /** VALID 有效 / CANCELLED 已取消 */
    private String status;

    /** 员工姓名（下单时快照） */
    private String empName;

    /** 联系电话（快照） */
    private String phone;

    /** 工位信息（快照） */
    private String workstation;

    /** 下单时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /** 总计价格（元） */
    private BigDecimal totalPrice;

    /** 点餐明细 */
    private List<OrderItemVO> items;
}
