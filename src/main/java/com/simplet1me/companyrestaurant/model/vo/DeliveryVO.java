package com.simplet1me.companyrestaurant.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 配餐批量订单视图（配餐员配送用）
 */
@Data
public class DeliveryVO {

    /** 用餐日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mealDate;

    /** 当日全部有效订单（含送餐信息与明细） */
    private List<OrderVO> orders;
}
