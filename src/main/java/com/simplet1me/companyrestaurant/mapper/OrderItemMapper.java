package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.OrderItem;
import com.simplet1me.companyrestaurant.model.vo.ReportItemVO;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * 订单明细表 Mapper（快照）
 */
public interface OrderItemMapper {

    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    List<OrderItem> findByOrderIds(@Param("orderIds") List<Long> orderIds);

    int insertBatch(@Param("items") List<OrderItem> items);

    int deleteByOrderId(@Param("orderId") Long orderId);

    /** 按用餐日期区间聚合统计（userId 可选）：菜名+单位分组，分量/金额求和 */
    List<ReportItemVO> sumGroupBy(@Param("userId") Long userId,
                                  @Param("start") LocalDate start, @Param("end") LocalDate end);
}
