package com.simplet1me.companyrestaurant.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

/**
 * 当前订餐状态视图
 */
@Data
public class OrderStatusVO {

    /** 当前是否在订餐时间窗口内 */
    private Boolean canOrder;

    /** 若可订，本次订单对应的用餐日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mealDate;

    /** 订餐截止时间 HH:mm */
    private String deadline;

    /** 配餐开始时间 HH:mm */
    private String serveStartTime;

    /** 不可订时的原因提示 */
    private String reason;
}
