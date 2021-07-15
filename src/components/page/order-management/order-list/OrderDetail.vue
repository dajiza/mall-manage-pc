<template>
    <div class="order-detail-container">
        <div class="container-box container-order-status">当前订单状态：{{orderStatus(order_info.status)}}</div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>用户信息</span>
                    </div>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box">
                    <div class="info-content-item">
                        <p class="label">微信昵称：</p>
                        <p class="info-value">{{order_info.user_name}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">用户手机号：</p>
                        <p class="info-value">{{order_info.user_phone}}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>收货信息</span>
                    </div>
                    <el-button
                            type="primary"
                            v-if="order_info.status < 3"
                            v-hasPermission="'mall-backend-update-logistics'"
                            @click="handleUpdateLogistics"
                    >修改</el-button>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box">
                    <div class="info-content-item">
                        <p class="label">用户ID：</p>
                        <p class="info-value">{{order_info.user_id}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">收货人姓名：</p>
                        <p class="info-value">{{order_info.logistics_name}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">收货人手机号：</p>
                        <p class="info-value">{{order_info.logistics_phone}}</p>
                    </div>
                    <div class="info-content-item" style="width: unset">
                        <p class="label">收货地址：</p>
                        <p class="info-value">{{order_info.logistics_province}}{{order_info.logistics_city}}{{order_info.logistics_area}}{{order_info.logistics_address}}</p>
                    </div>
                </div>
                <!--<div class="logistics-address">
                    <p class="label">收货地址：</p>
                    <p class="info-value">{{order_info.logistics_province}}{{order_info.logistics_city}}{{order_info.logistics_area}}{{order_info.logistics_address}}</p>
                </div>-->
            </div>
        </div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>快递信息</span>
                        <span class="split-order" v-show="back_is_split(order_info)">本订单已拆分发货，可在下方订单信息中查看对应产品物流</span>
                    </div>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box">
                    <div class="info-content-item">
                        <span class="label">快递公司：</span>
                        <p class="info-value">{{order_info.logistics_company_name}}</p>
                    </div>
                    <div class="info-content-item">
                        <span class="label">快递单号：</span>
                        <p class="info-value">{{order_info.logistics_no}}</p>
                    </div>
                </div>
            </div>

        </div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>订单备注</span>
                    </div>
                    <el-button
                            type="primary"
                            v-hasPermission="'mall-backend-add-remark'"
                            @click="handleAddRemarks"
                    >添加留言</el-button>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box flex-column">
                    <div class="info-content-item info-remarks">
                        <span class="label">用户留言：</span>
                        <p class="info-value">{{order_info.message}}</p>
                    </div>
                    <div class="info-content-item info-remarks" v-show="order_info.remark">
                        <span class="label">平台留言：</span>
                        <p class="info-value remark-text-color">{{order_info.remark}}</p>
                    </div>
                </div>
            </div>

        </div>
        <div class="container m-t-16 order-info-container table-has-img">
            <div class="line"></div>
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>订单信息</span>
                </div>
                <div class="field-show">
                    <el-popover popper-class="field-pop" placement="bottom-end" width="250" trigger="click">
                        <span slot="reference" class="icon iconfont icon-open1"></span>
                        <div class="all-select">
                            <el-checkbox v-model="is_all_select" @change="isAllChange" >全选</el-checkbox>
                        </div>
                        <div class="list-box">
                            <div class="list-item" v-for="(item, i) in allList">
                                <el-checkbox v-model="item.is_show" @change="itemChange">{{item.name}}</el-checkbox>
                            </div>
                        </div>
                    </el-popover>
                </div>
                <!--<el-button
                    class="btn-refund"
                    type="danger"
                    v-if="false"
                    @click="handleRefundAll()"
                >全部退款</el-button>-->
            </div>
            <el-table
                    :data="order_info.detail"
                    :border="true"
                    ref="multipleTable"
                    class="order-detail-info"
            >
                <el-table-column
                        label="操作"
                        width="130"
                        :resizable="true"
                        v-if="order_info.status !== 9 && back_field_show('操作')"
                >
                    <template slot-scope="scope">
                        <div style="padding: 3px 0" v-show="scope.row.status > 0 && scope.row.status < 4">
                            <el-button
                                    type="danger"
                                    v-hasPermission="'mall-backend-order-apply'"
                                    @click="handleRebates(scope.$index,scope.row)"
                            >部分退款</el-button>
                        </div>
                        <div style="padding: 3px 0" v-show="order_info.status === 0">
                            <el-button
                                    type="primary"
                                    v-hasPermission="'mall-backend-order-detail-update'"
                                    @click="handleUpdatePrice(scope.$index,scope.row)"
                            >修改价格</el-button>
                        </div>
                        <!--                        v-if="order_info.status === 0 || order_info.logistics_no"-->
                        <div style="padding: 3px 0" v-show="order_info.logistics_no" v-hasPermission="'mall-backend-order-sd-info'">
                            <el-button
                                    type="primary"
                                    :disabled="!(scope.row.status === 3 || scope.row.status === 10)"
                                    @click="handleViewLogistics(scope.$index,scope.row)"
                            >查看物流</el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="图片" width="140" :resizable="true" v-if="back_field_show('图片')">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.product_img)" alt="" @click="viewBigImg(scope.row.product_img, scope.$index)">
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称" width="200" :resizable="true" v-if="back_field_show('产品名称')"></el-table-column>
                <el-table-column prop="product_code" label="SKU编码" width="150" :resizable="true" v-if="back_field_show('SKU编码')"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" width="200" :resizable="true" v-if="back_field_show('商品名称')"></el-table-column>
                <el-table-column label="规格" width="160" :resizable="true" v-if="back_field_show('规格')">
                    <template slot-scope="scope">
                        <p v-for="(item,i) in back_goods_attr(scope.row.goods_attr)">{{item['Title']}}：{{item['Value']}}</p>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="133" :resizable="true" v-if="back_field_show('订单状态')">
                    <template slot-scope="scope">
                        <span class="order-status" :class="orderStatusClass(scope.row.status)"
                        >{{scope.row.status_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="类型" width="90" :resizable="true" v-if="back_field_show('类型')">
                    <template slot-scope="scope">
                        <span>{{scope.row.detail_type == 1 ? '加价购':'普通'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="单价(元)" :resizable="true" v-if="back_field_show('单价(元)')">
                    <template slot-scope="scope">
                        <span>{{(scope.row.price/100) | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="num" label="数量" :resizable="true" v-if="back_field_show('数量')"></el-table-column>
                <el-table-column label="总价(元)" v-if="back_field_show('总价(元)')">
                    <template slot-scope="scope">
                        <span>{{((Number(scope.row.price) * Number(scope.row.num))/100) | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="off_2" label="促销优惠(元)" width="140" :resizable="true" v-if="back_field_show('促销优惠(元)')">
                    <template slot-scope="scope">
                        <span>{{scope.row.off_3/100 | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="off_1" label="优惠券(元)" width="120" :resizable="true" v-if="back_field_show('优惠券(元)')">
                    <template slot-scope="scope">
                        <span>{{scope.row.off_1/100 | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price_real" label="改价(元)" width="120" :resizable="true" v-if="back_field_show('改价(元)')">
                    <template slot-scope="scope">
                        <div class="change-price">
                            <span>{{ scope.row.price_sum_change/100 | rounding}}</span>
                            <el-popover
                                    popper-class="update-list-popover"
                                    placement="top-end"
                                    width="540"
                                    trigger="click">
                                <div class="popover-title">改价记录</div>
                                <el-table style="margin: 16px 0 36px" :data="orderPriceUpdateList">
                                    <el-table-column width="100" property="date" label="改价(元)">
                                        <template slot-scope="childrenScope">
                                            <span>{{childrenScope.row.change_price/100 | rounding}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="160" property="reason_name" label="改价原因"></el-table-column>
                                    <el-table-column width="100" property="user_name" label="操作人"></el-table-column>
                                    <el-table-column width="180" property="updated_time" label="操作时间"></el-table-column>
                                </el-table>
                                <div
                                        class="pos-absolute"
                                        :ref="'changeListTip-'+ scope.row.id"
                                        slot="reference"
                                        v-hasPermission="'mall-backend-order-detail-change-list'"
                                >
                                    <i class="remark-tip-img cursor-class"></i>
                                </div>
                            </el-popover>
                            <div
                                    class="remark-tip-wrap"
                                    slot="reference"
                                    v-hasPermission="'mall-backend-order-detail-change-list'"
                                    @click="getOrderPriceChangeList(scope.$index,scope.row)">
                                <i class="remark-tip-img cursor-class"></i>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="off_1" label="会员折扣(元)" width="120" :resizable="true" v-if="back_field_show('会员折扣(元)')">
                    <template slot-scope="scope">
                        <span>{{scope.row.off_2/100 | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price_real" label="实付(元)" :resizable="true" v-if="back_field_show('实付(元)')">
                    <template slot-scope="scope">
                        <span>{{scope.row.price_sum_end/100 | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="refund_money" label="退款金额(元)" width="120" :resizable="true" v-if="back_field_show('退款金额(元)')">
                    <template slot-scope="scope">
                        <div class="change-price">
                            <span>{{ scope.row.refund_money/100 | rounding}}</span>
                            <el-popover
                                    popper-class="update-list-popover"
                                    placement="top-end"
                                    width="740"
                                    trigger="click">
                                <div class="popover-title">退款金额记录</div>
                                <el-table style="margin: 16px 0 36px" :data="detailReturnMoneyList">
                                    <el-table-column width="100" property="date" label="金额(元)">
                                        <template slot-scope="childrenScope">
                                            <span>{{childrenScope.row.money/100 | rounding}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="100" property="date" label="类型">
                                        <template slot-scope="childrenScope">
                                            <span>{{back_type_cn(childrenScope.row.type)}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="100" property="date" label="状态">
                                        <template slot-scope="childrenScope">
                                            <span>{{ REFUND_STATUS[childrenScope.row.status] }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="260" property="reason" label="原因"></el-table-column>
                                    <!--<el-table-column width="100" property="user_name" label="操作人"></el-table-column>-->
                                    <el-table-column width="180" property="updated_time" label="操作时间"></el-table-column>
                                </el-table>
                                <div
                                        class="pos-absolute"
                                        :ref="'returnMoneyTip-'+ scope.row.id"
                                        slot="reference"
                                        v-hasPermission="'mall-backend-order-detail-change-list'"
                                >
                                    <i class="remark-tip-img cursor-class"></i>
                                </div>
                            </el-popover>
                            <div
                                    class="remark-tip-wrap"
                                    slot="reference"
                                    v-hasPermission="'mall-backend-order-detail-change-list'"
                                    @click="getDetailReturnMoney(scope.$index,scope.row)">
                                <i class="remark-tip-img cursor-class"></i>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="price_real" label="佣金(元)" width="100" :resizable="true" v-if="back_field_show('佣金(元)')">
                    <template slot-scope="scope">
                        <span v-if="scope.row.commission_status!=3">{{scope.row.commission/100 | rounding}}</span>
                        <span v-else>0</span>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="order-base-info clearfix">
                <div class="order-code-time">
                    <div class="code-time clearfix">
                        <div class="info-item">
                            <span class="label">订单号：</span>
                            <span class="info-value">{{order_info.order_no}}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">付款时间：</span>
                            <span class="info-value">{{order_info.paid_time}}</span>
                        </div>
                    </div>
                    <div class="code-time clearfix">
                        <div class="info-item">
                            <span class="label">下单时间：</span>
                            <span class="info-value">{{order_info.created_time}}</span>
                        </div>
                        <div class="info-item w320">
                            <span class="label">支付交易号：</span>
                            <span class="info-value">{{order_info.pay_no}}</span>
                        </div>
                    </div>
                </div>
                <div class="order-amount clearfix">
                    <div class="order-amount-item total-order">
                        <div class="amount-name">数量合计</div>
                        <div class="amount-value" style="color: #333333">{{num_total_all}}</div>
                    </div>
                    <div class="order-amount-item shipping">
                        <div class="amount-name">
                            <span>运费</span>
                            <div
                                    class="update-icon-box"
                                    v-if="order_info.status === 0"
                                    v-hasPermission="'mall-backend-order-freight-update'"
                                    @click="updateShipping">
                                <img
                                        class="update-icon"
                                        src="../../../../assets/img/updateIcon.svg"
                                        alt="" />
                            </div>
                            <div
                                    class="update-icon-box"
                                    v-if="order_info.status > 0 && order_info.status!==9 && order_info.logistics_money > 0"
                                    v-hasPermission="'mall-backend-order-apply-freight'"
                                    @click="handleReturnFreight">
                                <img
                                        class="update-icon"
                                        src="../../../../assets/img/return-freight.svg"
                                        alt="" />
                            </div>
                        </div>
                        <div class="amount-value">
                            <el-popover
                                    popper-class="logistics-update-list-popover"
                                    placement="top"
                                    width="540"
                                    trigger="click">
                                <div class="popover-title">改运费记录</div>
                                <el-table style="margin: 16px 0 36px" :data="FreightUpdateList">
                                    <el-table-column width="100" property="date" label="改价(元)">
                                        <template slot-scope="childrenScope">
                                            <span>{{childrenScope.row.change_price/100 | rounding}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="160" property="reason_name" label="改价原因"></el-table-column>
                                    <el-table-column width="100" property="user_name" label="操作人"></el-table-column>
                                    <el-table-column width="180" property="updated_time" label="操作时间"></el-table-column>
                                </el-table>
                                <i
                                        class="remark-tip-img cursor-class marginRight8"
                                        slot="reference"
                                        v-hasPermission="'mall-backend-freight-change-list'"
                                ></i>
                            </el-popover>
                            <span v-show="order_info.logistics_money > 0">¥ {{order_info.logistics_money/100 | rounding}}</span>
                            <span v-show="!order_info.logistics_money">¥ 0.00</span>
                        </div>
                    </div>
                    <div class="order-amount-item total-order">
                        <div class="amount-name">订单总计</div>
                        <div class="amount-value">¥ {{order_info.price_total/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item coupon-total">
                        <div class="amount-name">优惠券</div>
                        <div class="amount-value">¥ {{order_info.off_1/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item activity-discount">
                        <div class="amount-name">促销优惠</div>
                        <div class="amount-value">¥ {{order_info.off_3/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item activity-discount">
                        <div class="amount-name">改价总额</div>
                        <div class="amount-value">¥ {{order_info.price_total_changed/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item buyer-pays">
                        <div class="amount-name">买家实付</div>
                        <div class="amount-value">¥
                            <span v-if="order_info.status === 9">0.00</span>
                            <span v-else>{{ (order_info.price_total_real / 100) | rounding }}</span>
                        </div>
                    </div>
                    <div class="order-amount-item shipping">
                        <div class="amount-name">退款金额</div>
                        <div class="amount-value">
                            <el-popover
                                    popper-class="logistics-update-list-popover"
                                    placement="top"
                                    width="260"
                                    trigger="click">
                                <div class="popover-title">退款金额记录</div>
                                <el-table style="margin: 16px 0 36px" :data="returnMoneyList">
                                    <el-table-column width="100" property="date" label="金额(元)">
                                        <template slot-scope="childrenScope">
                                            <span>{{childrenScope.row.money/100 | rounding}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="160" property="type" label="类型"></el-table-column>
                                </el-table>
                                <i
                                        class="remark-tip-img cursor-class marginRight8"
                                        slot="reference"
                                        v-hasPermission="'mall-backend-freight-change-list'"
                                ></i>
                            </el-popover>
                            <span>¥ {{refund_money_all/100 | rounding}}</span>
                        </div>
                    </div>
                    <div class="order-amount-item activity-discount" v-if="order_info.channel_id !== 1">
                        <div class="amount-name">佣金</div>
                        <div class="amount-value">¥ {{order_info.all_commission/100 | rounding}}</div>
                    </div>
                </div>
            </div>
        </div>
        <!--修改日志-->
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i class="line"></i>
                        <span class="title-span">修改日志</span>
                    </div>
                </div>
            </div>
            <div class="info-content">
                <el-main class="log-wrap" v-if="query_end">
                    <template v-if="show_log_list.length > 0 && query_end">
                        <div class="item-box" v-for="(item,i) in show_log_list" :key="i">
                            <template>
                                <div class="left-box">
                                    <!--                                    <div class="date">{{(returnDate(item.created_at))[0] || ''}}</div>-->
                                    <div class="time">{{$moment(item.created_time).format('MM-DD HH:mm:ss') }}</div>
                                </div>
                                <div class="center-box">
                                    <div class="point-wrap"></div>
                                    <div class="top-line" v-show="i>0"></div>
                                    <div class="bottom-line" v-show="i< show_log_list.length -1 && show_log_list.length > 1"></div>
                                </div>
                                <div class="right-box">
                                    <div class="operator padding-14 font-class">操作人：{{item.user_name}}</div>
                                    <div class="line-box"></div>
                                    <div class="right-content">
                                        <!--type 0:修改订单金额，1:修改邮费 2修改订单地址 3修改发货单号  4添加后台留言 5售后-->
                                        <!--修改订单金额-->
                                        <template v-if="item.type == 0">
                                            <div class="goods-img-title" v-for="(goods,goods_i) in item.goods_list">
                                                <div class="goods-img" @click="viewLogBigImg(item.goods_list, goods_i)">
                                                    <img :src="getImg(goods.goods_img)" alt="" >
                                                </div>
                                                <div class="goods-title">{{goods.goods_name}}</div>
                                            </div>
                                            <div class="marginTop20">改价：{{formatMoney(item.change_price)}}元</div>
                                            <div class="marginTop20">改价原因：{{item.reason_name}}</div>
                                        </template>
                                        <!--修改邮费-->
                                        <template v-if="item.type == 1">
                                            <div>运费改价：{{formatMoney(item.change_price)}}元</div>
                                            <div class="marginTop20">改价原因：{{item.reason_name}}</div>
                                        </template>
                                        <!--2修改订单地址-->
                                        <template v-if="item.type == 2">
                                            <div>修改收货信息：</div>
                                            <div class="marginTop20">原信息：</div>
                                            <div>收货人姓名：{{item.old_value.logistics_name || ''}} </div>
                                            <div>收货人手机号：{{item.old_value.logistics_phone || ''}}  </div>
                                            <div>收货地址：{{item.old_value.logistics_province || ''}}{{item.old_value.logistics_city || ''}}{{item.old_value.logistics_area || ''}}{{item.old_value.logistics_address || ''}}</div>
                                            <div class="marginTop20">更改为：</div>
                                            <div>收货人姓名：{{item.new_value.logistics_name || ''}} </div>
                                            <div>收货人手机号：{{item.new_value.logistics_phone || ''}}  </div>
                                            <div>收货地址：{{item.new_value.logistics_province || ''}}{{item.new_value.logistics_city || ''}}{{item.new_value.logistics_area || ''}}{{item.new_value.logistics_address || ''}}</div>
                                        </template>
                                        <!--3修改发货单号-->
                                        <template v-if="item.type == 3">
                                            <div class="goods-img-title" v-for="(goods,goods_i) in item.goods_list">
                                                <div class="goods-img">
                                                    <img :src="getImg(goods.goods_img)" alt="" @click="viewLogBigImg(item.goods_list, goods_i)">
                                                </div>
                                                <div class="goods-title">{{goods.goods_name}}</div>
                                            </div>
                                            <div class="marginTop20">原：</div>
                                            <div class="marginTop20">快递公司：{{item.old_value.logistics_company_name}}</div>
                                            <div class="marginTop20">快递单号：{{item.old_value.logistics_no}}</div>
                                            <div class="marginTop20">改为：</div>
                                            <div class="marginTop20">快递公司：{{item.new_value.logistics_company_name}}</div>
                                            <div class="marginTop20">快递单号：{{item.new_value.logistics_no}}</div>
                                        </template>
                                        <!--添加留言-->
                                        <template v-if="item.type == 4">
                                            <div>添加留言：</div>
                                            <div>{{item.new_value}}</div>
                                        </template>
                                        <!--售后-->
                                        <template v-if="item.type == 5">
                                            <div class="goods-img-title" v-for="(goods,goods_i) in item.goods_list">
                                                <div class="goods-img">
                                                    <img :src="getImg(goods.goods_img)" alt="" @click="viewLogBigImg(item.goods_list, goods_i)">
                                                </div>
                                                <div class="goods-title">{{goods.goods_name}}</div>
                                            </div>
                                            <div>{{item.new_value}}</div>
                                            <div class="marginTop20">退款金额：{{formatMoney(item.change_price)}}元</div>
                                            <!--<div class="marginTop20">类型：</div>
                                            <div class="marginTop20">状态：</div>
                                            <div class="marginTop20">原因：</div>-->
                                        </template>
                                    </div>

                                </div>
                            </template>
                        </div>
                    </template>
                    <div v-if="show_log_list.length < 1 && query_end">
                        <EmptyList></EmptyList>
                    </div>
                </el-main>
            </div>
        </div>
        <!--添加留言-->
        <el-dialog
                title="添加留言"
                :visible.sync="remarksVisible"
                width="420px"
                :destroy-on-close="true"
                :before-close="remarksClose"
                :close-on-click-modal="false"
                append-to-body
        >
            <el-form ref="remarksFormBox" :model="remarksForm"
                     :rules="remarksFormRules" label-width="55px" class="record-form">
                <el-form-item label="备注:" prop="remarks">
                    <el-input
                            ref="remarkInput"
                            type="textarea"
                            placeholder="请输入"
                            :autosize="{minRows: 4,maxRows: 10}"
                            v-model="remarksForm.remarks"
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="remarksClose">取 消</el-button>
                <el-button type="primary" @click="handleSureRemarks">确 定</el-button>
            </span>
        </el-dialog>
        <!--查看物流-->
        <el-dialog
                title="物流信息"
                :visible.sync="logisticsVisible"
                width="800px"
                :destroy-on-close="true"
                custom-class="logistics-info-dialog"
                append-to-body
        >
            <div slot="title">
                <div class="logistics-info-box">
                    <span>快递公司：{{view_logistics_company_name}}</span>
                    <span style="margin-left: 20px" class="logistics-no">快递单号：{{view_logistics_no}}</span>
                </div>
            </div>
            <div class="logistics-timeline-box" id="logisticsTimelineBox">
                <el-timeline>
                    <el-timeline-item
                            v-for="(activity, index) in activities"
                            :key="index"
                            :icon="activity.icon"
                            :type="activity.type"
                            :color="activity.color"
                            :size="activity.size"
                            :timestamp="activity.timestamp">
                        {{activity.content}}
                    </el-timeline-item>
                </el-timeline>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="logisticsVisible = false">O K</el-button>
            </span>
        </el-dialog>
        <!-- 修改价格弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="priceUpdateVisible" width="380px"
                   :before-close="dialogClose" :destroy-on-close="true" :close-on-click-modal="false">
            <el-form class="update-price-form" ref="formBox" :model="priceUpdateForm" :rules="priceUpdateFormRules">
                <el-form-item label-width="1px">
                    <el-radio-group v-model="priceUpdateForm.radio" @change="changeType">
                        <el-radio :label="0">现价</el-radio>
                        <el-radio :label="1">折扣
                            <span style="color: rgba(0,0,0,.65)" v-show="priceUpdateForm.discount">（折扣后：{{priceAfterDiscount}}元）</span>
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="priceUpdateForm.radio === 0" label="" prop="price">
                    <el-input
                            placeholder="请输入金额"
                            :precision="2"
                            autofocus="autofocus"
                            v-model="priceUpdateForm.price"
                    ></el-input>
                    <span style="margin-left: 10px">元</span>
                </el-form-item>
                <el-form-item v-if="priceUpdateForm.radio === 1" label="" prop="discount">
                    <el-input
                            placeholder="请输入折扣"
                            :precision="2"
                            autofocus="autofocus"
                            v-model="priceUpdateForm.discount"
                            @blur="discountBlur"
                            @input="discount_num_change"
                    ></el-input>
                    <span style="margin-left: 10px">折</span>
                </el-form-item>
                <el-form-item label="修改原因" prop="reason">
                    <el-select filterable v-model="priceUpdateForm.reason" placeholder="请选择">
                        <el-option
                                v-for="state in modifyPriceReason"
                                :key="state.id"
                                :value="state.name"
                                :label="state.name"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="sureUpdate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改运费弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="shippingUpdateVisible" width="380px"
                   :before-close="dialogClose" :destroy-on-close="true" :close-on-click-modal="false">
            <el-form class="update-price-form" ref="shippingFormBox" :model="shippingUpdateForm" :rules="shippingUpdateFormRules">
                <el-form-item :label="moneyUpdateLabel" prop="shipping">
                    <el-input
                            placeholder="请输入金额"
                            :precision="2"
                            autofocus="autofocus"
                            v-model="shippingUpdateForm.shipping"
                    ></el-input>
                </el-form-item>
                <el-form-item label="修改原因" prop="reason">
                    <el-select filterable v-model="shippingUpdateForm.reason" placeholder="请选择">
                        <el-option
                                v-for="state in modifyShippingReason"
                                :key="state.id"
                                :value="state.name"
                                :label="state.name"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="sureUpdate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 部分退款/部分退运费 弹出框 -->
        <el-dialog :title=" '部分' + rebatesDialogTitle" :visible.sync="rebatesDialogVisible" width="380px"
                   :before-close="rebatesDialogClose" :destroy-on-close="true" :close-on-click-modal="false">
            <el-form class="update-price-form" ref="rebatesFormBox" :model="rebatesForm" :rules="rebatesFormRules">
                <el-form-item :label="rebatesDialogTitle === '退款' ? '部分退款金额' : '部分退运费金额'" prop="money">
                    <el-input
                            placeholder="请输入金额"
                            :precision="2"
                            autofocus="autofocus"
                            v-model="rebatesForm.money"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="rebatesDialogTitle === '退款' ? '部分退款原因' : '部分退运费原因'" prop="reason">
                    <el-input
                            placeholder="请输入原因"
                            v-model="rebatesForm.reason"
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="rebatesDialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSureRebates('rebatesFormBox')">确 定</el-button>
            </span>
        </el-dialog>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisible" :on-close="closeViewer" :url-list="imgSrcList" :initial-index="previewIndex"/>
        <!--<ListFieldShow :local="'orderDetailField'" :allList="allList"></ListFieldShow>-->
        <!--修改收货信息-->
        <updateLogistics :provinceList="provinceList" :updateLogisticsInfo="updateLogisticsInfo" @update="handleSureUpdateLogistics" @handleClose="handleCloseUpdateLogistics"></updateLogistics>
    </div>
</template>

<script>
    import './OrderList.less';
    import { queryConfigList, queryProvince } from '../../../../api/configManagement';
    import { getOrderDetail, getAddRemarks, queryFreightChangeList, queryOrderDetailChangeList, updateFreight,
        updateOrderDetail, queryOrderSdInfo, updateRebatesMoney, updateRebatesFreight, queryDetailReturnMoneyRecord, updateOrderAddress, queryOrderChangeLog } from '../../../../api/orderList';
    import { queryAfterSaleList } from '../../../../api/afterSale';
    import ElImageViewer from '@/components/common/image-viewer';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import { queryReasonList } from '../../../../api/afterSaleReason';
    import commUtil from '../../../../utils/commUtil';
    import { REFUND_STATUS } from '@/plugin/constant'
    import ListFieldShow from '../../../common/list-field-show/listFieldShow';
    import updateLogistics from '../../../common/update-logistics/UpdateLogistics';
    import { querySDList } from '@/api/afterSale'
    import { formatMoney } from '@/plugin/tool'
    export default {
        name: 'OrderDetail',
        data() {
            var checkRebatesMoney = (rule, value, callback) => {
                setTimeout(() => {
                    const num1 = commUtil.numberMul(Number(value),100);
                    const num2 = commUtil.numberMul(Number(this.realPay),100);
                    if ( num1 > num2) {
                        callback(new Error('退款金额不得高于实付金额' + this.realPay));
                    } else {
                        callback();
                    }
                }, 10);
            };
            var checkLastNum = (rule, value, callback) => {
                setTimeout(() => {
                    const num1 = commUtil.numberMul(Number(value),100);
                    const num2 = commUtil.numberMul(Number(this.minPrice),100);
                    if ( num1 < num2) {
                        callback(new Error('现价应不低于' + this.minPrice));
                    } else {
                        callback();
                    }
                }, 10);
            };
            var checkDiscount = (rule, value, callback) => {
                setTimeout(() => {
                    const num1 = commUtil.numberMul(Number(value),100);
                    const num2 = commUtil.numberMul(Number(100 - this.MoneyChangeMax),10);
                    if ( num1 < num2) {
                        const num = (100 - this.MoneyChangeMax)/10
                        callback(new Error('最低折扣不低于' + num + '折'));
                    } else {
                        callback();
                    }
                }, 10);
            };
            return{
                REFUND_STATUS,
                pageInfo: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                pageTotal: 0, // 总条数
                remarksVisible:false,
                remarksForm:{
                    remarks:''
                },
                remarksFormRules: {
                    remarks: [
                        { required: true, message: '请输入留言', trigger: 'blur' },
                        { max: 255, message: '最多可输入255个字符', trigger: 'blur' }
                    ]
                },
                order_info:{},
                imgBaseUrl:'',
                order_list:[],
                logisticsVisible:false,
                view_logistics_company_name:'',
                view_logistics_no:'',
                goodsData:[],
                goodsPageInfo: {
                    pageIndex: 1,
                    pageSize: 2
                },
                product_unit:'',
                need_num:0,
                priceUpdateVisible: false, // 价格
                shippingUpdateVisible: false, // 运费修改弹框
                dialogTitle:'',
                shippingUpdateForm:{
                    shipping:'', // 运费
                    reason:''
                },
                priceUpdateForm:{
                    radio:0,
                    discount: '', // 折扣
                    price:'',  // 订单价格
                    reason:''
                },
                shippingUpdateFormRules: {
                    shipping: [
                        { required: true, message: '请输入金额', trigger: 'blur' },
                        { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' }
                    ],
                    reason: [
                        { required: true, message: '请输入修改原因', trigger: 'blur' }
                    ]
                },
                priceUpdateFormRules: {
                    discount: [
                        { required: true, message: '请输入折扣', trigger: 'blur' },
                        { validator: checkDiscount, trigger: ['blur'] },
                        { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' }
                    ],
                    price: [
                        { required: true, message: '请输入金额', trigger: 'blur' },
                        { validator: checkLastNum, trigger: ['blur'] },
                        { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' }
                    ],
                    reason: [
                        { required: true, message: '请输入修改原因', trigger: 'change' }
                    ]
                },
                FreightUpdateList:[], // 运费更改列表
                orderPriceUpdateList:[], // 订单价格修改列表
                loadingTip:{},
                orderDetailId: -1,
                MoneyChangeMax: 0,
                moneyUpdateLabel: '',
                minPrice: 0,
                modifyPriceReason:[], // 修改价格理由列表
                modifyShippingReason:[], // 修改运费理由列表
                priceAfterDiscount:'', // 折后价
                currentPrice:'',  // 修改时订单价格
                activities:[],
                rebatesDialogVisible: false, // 部分退款 || 退运费 弹框 显示隐藏
                rebatesDialogTitle: '退款', // 部分退款/退运费 弹框标题
                rebatesForm: {
                    money:'', // 退款||运费
                    reason:''
                },
                rebatesFormRules: {
                    money: [
                        { required: true, message: '请输入金额', trigger: 'blur' },
                        { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' },
                        { validator: checkRebatesMoney, trigger: ['blur'] },
                    ],
                    reason: [
                        { required: true, message: '请输入原因', trigger: 'blur' }
                    ]
                },
                realPay: 0, // 实际支付（部分退款）
                returnMoneyList: [], // 退款金额记录列表
                detailReturnMoneyList: [], // 子订单退款金记录列表
                refund_money_all: 0, // 退款总额
                num_total_all: 0, // 商品总数
                allList:[],
                default_List:[
                    {name:'操作', is_show: true},
                    {name:'图片', is_show: true},
                    {name:'产品名称', is_show: true},
                    {name:'SKU编码', is_show: true},
                    {name:'商品名称', is_show: true},
                    {name:'规格', is_show: true},
                    {name:'订单状态', is_show: true},
                    {name:'类型', is_show: true},
                    {name:'单价(元)', is_show: true},
                    {name:'数量', is_show: true},
                    {name:'总价(元)', is_show: true},
                    {name:'促销优惠(元)', is_show: true},
                    {name:'优惠券(元)', is_show: true},
                    {name:'改价(元)', is_show: true},
                    {name:'会员折扣(元)', is_show: true, is_new: true},
                    {name:'实付(元)', is_show: true},
                    {name:'退款金额(元)', is_show: true},
                    {name:'佣金(元)', is_show: true}
                ],
                local_show:[],
                is_all_select: true,
                previewIndex: 0,
                imgSrcList:[],
                orderImgList: [],
                logImgList: [],
                dialogVisible: false,
                updateLogisticsInfo:{
                    visible: false,
                    info: {}
                },
                provinceList: [],
                cityList: [],
                areaList: [],
                show_log_list: [],
                query_end: false
            }
        },
        components: {
            ElImageViewer,
            EmptyList,
            ListFieldShow,
            updateLogistics
        },
        computed: {
            //  拼接图片地址
            getImg: function () {
                return (data) => {
                    if(data){
                        return data + '!/fw/' + 80;
                    }
                }
            },
            orderStatus: function() {
                return data => {
                    if (data === 0) {
                        return '待付款';
                    } else if (data === 1) {
                        return '已付款';
                    } else if (data === 2) {
                        return '处理中';
                    } else if (data === 3) {
                        return '待收货';
                    } else if (data === 9) {
                        return '交易关闭';
                    } else if (data === 10) {
                        return '交易成功';
                    }
                };
            },
            orderStatusClass: function () {
                return (data) =>{
                    if(data === 0 ){
                        return 'order-pending-payment'
                    }else if(data === 1 ){
                        return 'order-paid'
                    }else if(data === 2){
                        return 'order-to-be-delivered'
                    }else if(data === 3){
                        return 'order-shipped'
                    }else if((data === 5 || data === 6 || data === 7)){
                        return 'order-refunding'
                    }else if((data === 4 || data === 8 || data === 9 || data === 11)){
                        return 'order-cancelled'
                    }else if((data === 10)){
                        return 'order-successfully'
                    }
                }
            },
            back_is_split:function() {
                return (data) =>{
                    let is_split = false;
                    let _arr = [];
                    if(data.detail){
                        data.detail.forEach((ev)=>{
                            if(ev.logistics_unique && _arr.indexOf(ev.logistics_unique) === -1){
                                _arr.push(ev.logistics_unique);
                            }
                        })
                        if(_arr.length > 1){
                            is_split = true;
                        }else {
                            is_split = false;
                        }
                    }
                    return is_split
                }
            },
            back_goods_attr:function() {
                return (data) =>{
                    let attr_arr = [];
                    if(data){
                        attr_arr = JSON.parse(data);
                    }
                    return attr_arr
                }
            },
            back_type_cn:function() {
                let type_cn = ''
                return (data) =>{
                    if(data < 3 ){
                        type_cn = '用户申请'
                    }else if(data === 3 ){
                        type_cn = '部分退款'
                    }else if(data === 4){
                        type_cn = '退运费'
                    }
                    return type_cn
                }
            },

            back_field_show:function() {
                let blo = true
                return (data) =>{
                    // console.log('allList', this.allList)
                    this.allList.forEach((ev,i)=>{
                        if(ev.name === data){
                            blo = ev.is_show
                        }
                    })
                    return blo
                }
            }
        },
        created() {
            this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
            this.getConfig();
            // 获取修改价格理由列表
            this.getReason1(5);
            // 获取修改运费理由列表
            this.getReason2(6);

            // 本地记录 字段显示列表 local_show
            console.log('orderDetailField', JSON.parse(localStorage.getItem('orderDetailField')))
            if(localStorage.getItem('orderDetailField')){
                let all_list  = JSON.parse(localStorage.getItem('orderDetailField'));
                let defaultList = _.cloneDeep(this.default_List)
                defaultList.forEach((default_ev)=>{
                    let len = all_list.filter(item => {return item.name == default_ev.name}).length
                    if(len == 0){
                        console.log('default_ev', default_ev)
                    }
                    all_list.forEach((ev)=>{
                        if(ev.name == default_ev.name){
                            default_ev['is_show'] = ev.is_show;
                        }
                    })
                })
                this.allList = defaultList
                this.itemChange();
            } else {
                this.allList = _.cloneDeep(this.default_List)
            }
        },
        mounted() {
            this.getProvince() // 省
            this.getOrderInfo();
            this.getFreightUpdateList(); // 请求运费修改列表
        },
        methods:{
            formatMoney: formatMoney,
            // 请求 - 修改日志
            getLog() {
                const params = {
                    order_id: Number(this.$route.query.order_id)
                }
                // const rLoading = this.openLoading();
                queryOrderChangeLog(params)
                    .then((res) => {
                        // rLoading.close();
                        this.query_end = true
                        if (res.code === 200) {
                            if (res.data) {
                                this.show_log_list = []
                                let new_arr = res.data || []
                                let change_code_arr = [] // type为3 change_code 不重复数组
                                const type_3_arr = new_arr.filter((item)=>{return item.type == 3})
                                type_3_arr.forEach((item)=>{
                                    if (!change_code_arr.includes(item.change_code)) {
                                        change_code_arr.push(item.change_code)
                                    }
                                })
                                new_arr.forEach((ev)=>{
                                    ev['goods_list'] = []
                                    this.order_info.detail.forEach((goods)=>{
                                        let list = []
                                        if (ev.order_detail_id == goods.id) {
                                            list.push(goods)
                                            ev['goods_list'] = list
                                        }
                                    })
                                    if (ev.type == 2 || ev.type == 3) {
                                        console.log('1111', JSON.parse(ev.new_value))
                                        ev['old_value'] = JSON.parse(ev.old_value)
                                        ev['new_value'] = JSON.parse(ev.new_value)
                                    }

                                })

                                let tempArr = [];
                                let afterData = []
                                for (let i = 0; i < new_arr.length; i++) {
                                    if (new_arr[i].type == 3) {
                                        if (tempArr.indexOf(new_arr[i].change_code) === -1) {
                                            afterData.push(new_arr[i]);
                                            tempArr.push(new_arr[i].change_code);
                                        } else {
                                            for (let j = 0; j < afterData.length; j++) {
                                                if (afterData[j].change_code == new_arr[i].change_code) {
                                                    console.log('goods_list=====afterData', afterData[j].goods_list)
                                                    console.log('goods_list-----new_arr', new_arr[i].goods_list)
                                                    if (new_arr[i].goods_list.length > 0) {
                                                        afterData[j].goods_list.push(new_arr[i].goods_list[0]);
                                                    }
                                                    // afterData[j].origin.push(new_arr[i]);
                                                    break;
                                                }
                                            }
                                        }
                                    } else {
                                        afterData.push(new_arr[i])
                                    }

                                }
                                console.log('afterData', afterData)
                                this.show_log_list = afterData
                            } else {
                            }
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },
            getProvince() {
                queryProvince()
                    .then(res => {
                       console.log('res', res)
                        this.provinceList = res.data || []
                    })
                    .catch(err => {})
            },

            // 请求 - 获取配置
            getConfig(){
                queryConfigList({})
                    .then((res) => {
                        if (res.code === 200) {
                            if (res.data){
                                res.data.forEach((ev)=>{
                                    if (ev.config_key === 'ORDER_MONEY_CHANGE_MAX'){
                                        // 金额允许修改的最大百分比
                                        this.MoneyChangeMax = ev.value;
                                    }
                                })
                            }
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 获取理由列表
            getReason1(num){
                let params = {
                    type: num
                };
                const rLoading = this.openLoading();
                queryReasonList(params).then((res) => {
                    rLoading.close();
                    if(res.code === 200){
                        this.modifyPriceReason = res.data || [];
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }
                }).catch(()=>{});
            },

            // 获取理由列表
            getReason2(num){
                let params = {
                    type: num
                };
                const rLoading = this.openLoading();
                queryReasonList(params).then((res) => {
                    rLoading.close();
                    if(res.code === 200){
                        this.modifyShippingReason = res.data || [];
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 1000
                        });
                    }
                }).catch(()=>{});
            },

            // 请求 - 详情信息
            getOrderInfo(){
                const params = {
                    id: Number(this.$route.query.order_id),
                    order_no:''
                }
                const rLoading = this.openLoading();
                // this.loadingTip = this.uploadLoading('加载中');
                getOrderDetail(params)
                    .then((res) => {
                        rLoading.close();
                        this.returnMoneyList = []
                        if (res.code === 200) {
                            if (res.data) {
                                this.order_info = res.data;
                                if(res.data.refund_money > 0){
                                    this.returnMoneyList.push({money:res.data.refund_money,type:'商品退款'})
                                }
                                if(res.data.refund_freight > 0){
                                    this.returnMoneyList.push({money:res.data.refund_freight,type:'运费退款'})
                                }
                                this.refund_money_all = Number(res.data.refund_money) + Number(res.data.refund_freight)
                                this.orderImgList = [];
                                this.num_total_all = 0
                                let all_commission = 0
                                if(this.order_info.detail) {
                                    this.order_info.detail.forEach((ev,i)=>{
                                        if(this.order_info.channel_id === 1){
                                            this.orderImgList.push(ev.goods_img + '!/fw/640');
                                        }else {
                                            this.orderImgList.push(ev.product_img + '!/fw/640');
                                        }
                                        this.num_total_all += Number(ev.num)
                                        if(ev.commission && ev.commission_status != 3){
                                            all_commission = all_commission + ev.commission
                                        }
                                    })
                                }
                                this.order_info['all_commission'] = all_commission
                                this.getLog()
                            } else {
                                this.order_info = {};
                            }
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 运费修改列表
            getFreightUpdateList(){
                const params = {
                    order_id: Number(this.$route.query.order_id)
                }
                queryFreightChangeList(params)
                    .then((res) => {
                        if (res.code === 200) {
                            this.FreightUpdateList = res.data || [];
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 订单价格修改列表
            getOrderPriceChangeList(i,row){
                const params = {
                    order_detail_id: row.id
                }
                const rLoading = this.openLoading();
                queryOrderDetailChangeList(params)
                    .then((res) => {
                        rLoading.close()
                        if (res.code === 200) {
                            this.orderPriceUpdateList = res.data || [];
                            const gv = 'changeListTip-' + row.id
                            this.$refs[gv].click();
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 按钮-添加留言
            handleAddRemarks(){
                if(this.order_info.remark){
                    this.$set(this.remarksForm,'remarks',this.order_info.remark);
                }
                this.remarksVisible = true;
                this.$nextTick(()=>{
                    this.$refs.remarkInput.focus();
                });
            },
            // 确定添加留言
            handleSureRemarks(){
                this.$refs['remarksFormBox'].validate((valid) => {
                    if (valid) {
                        const params = {
                            id: Number(this.$route.query.order_id),
                            order_no:'',
                            remark: this.remarksForm.remarks
                        }
                        const rLoading = this.openLoading();
                        getAddRemarks(params)
                            .then((res) => {
                                rLoading.close();
                                if (res.code === 200) {
                                    this.remarksVisible = false;
                                    this.getOrderInfo();
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 5000
                                    });
                                }
                            })
                            .catch(() => {});
                    }
                })
            },

            // 添加留言弹框关闭
            remarksClose(){
                this.$refs['remarksFormBox'].resetFields();
                this.$refs['remarksFormBox'].clearValidate();
                this.remarksVisible = false;
            },

            // 修改收货信息
            handleUpdateLogistics() {
                // updateLogisticsInfo
                const logistics_info = {
                    logistics_address: this.order_info.logistics_address,
                    logistics_area: this.order_info.logistics_area,
                    logistics_city: this.order_info.logistics_city,
                    logistics_province: this.order_info.logistics_province,
                    logistics_name: this.order_info.logistics_name,
                    logistics_phone: this.order_info.logistics_phone
                }
                this.$set(this.updateLogisticsInfo,'visible', true)
                this.updateLogisticsInfo = Object.assign({}, this.updateLogisticsInfo, { info: logistics_info, visible: true });
            },
            handleCloseUpdateLogistics() {
                this.$set(this.updateLogisticsInfo,'visible', false)
            },
            handleSureUpdateLogistics(data) {
                console.log('data', data)
                const params = {
                    order_id: Number(this.$route.query.order_id),
                    logistics_address: data.address,
                    logistics_area: data.area,
                    logistics_city: data.city,
                    logistics_province: data.province,
                    logistics_name: data.name,
                    logistics_phone: data.phone
                }
                updateOrderAddress(params)
                    .then((res) => {
                        if (res.code === 200) {
                            this.$notify({
                                title: '修改成功',
                                message: '',
                                type: 'success',
                                duration: 3000
                            });
                            this.$set(this.updateLogisticsInfo,'visible', false)
                            this.getOrderInfo()
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 查看大图
            viewBigImg(pic_url, index){
                if (pic_url) {
                    this.imgSrcList = this.orderImgList
                    this.previewIndex = index;
                    this.dialogVisible = true;
                }
            },
            // 关闭大图
            closeViewer() {
                this.dialogVisible = false;
            },
            // 日志查看大图
            viewLogBigImg(list, index){
                console.log('日志查看大图')
                console.log('list', list)
                this.logImgList = []
                if (list && list.length > 0) {
                    list.forEach((ev)=>{
                        if(this.order_info.channel_id === 1){ // 淘宝
                            this.logImgList.push(ev.goods_img + '!/fw/640');
                        }else {
                            this.logImgList.push(ev.product_img + '!/fw/640');
                        }
                    })

                    this.imgSrcList = this.logImgList
                    console.log('this.imgSrcList', this.imgSrcList)
                    this.previewIndex = index;
                    this.dialogVisible = true;
                }
            },
            // 查看物流
            handleViewLogistics(index,row){
                this.view_logistics_company_name = row.logistics_company_name;
                this.view_logistics_no = row.logistics_no;
                // this.logisticsVisible = true;
                // this.logisticsVisible = true;
                this.getSdInfo(row.id);
            },
            // 请求 - 物流信息
            getSdInfo(id){
                const params = {
                    order_id: -1,
                    order_detail_id: id,
                    apply_id:-1,
                }
                let _this = this;
                const rLoading = this.openLoading();
                this.activities = [];
                queryOrderSdInfo(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if (res.data) {
                                const logistics = res.data.logistics;
                                _this.view_logistics_company_name = logistics.logistics_company_name;
                                _this.view_logistics_no = logistics.logistics_no;
                                // _this.logisticsVisible = true;
                                let logisticss_list = res.data.lists || [];
                                let new_arr = logisticss_list.reverse();
                                new_arr.forEach((ev,index)=>{
                                    let params = {
                                        content: ev.message,
                                        timestamp: _this.formatDate(ev.time)
                                    }
                                    if(index === logisticss_list.length -1){
                                        params['color'] = '#FAAD14'
                                    }
                                    _this.activities.push(params);
                                })
                                _this.logisticsVisible = true;
                            }
                        } else {
                            _this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 发起退款 -手动调整弹出框
            handleRefund(index, row){
            },

            // 全部退款
            handleRefundAll(){},

            // 确定修改
            sureUpdate(){
                if (this.dialogTitle === '修改运费') {
                    this.$refs['shippingFormBox'].validate(valid => {
                        if (valid) {
                            const newPrice = commUtil.numberMul(Number(this.shippingUpdateForm.shipping),100);
                            const params = {
                                reason_name: this.shippingUpdateForm.reason,
                                order_id: Number(this.$route.query.order_id),
                                new_price: newPrice
                            };
                            const rLoading = this.openLoading();
                            const _this = this;
                            updateFreight(params)
                                .then((res) => {
                                    rLoading.close();
                                    if (res.code === 200) {
                                        this.$notify({
                                            title: '运费修改成功',
                                            message: '',
                                            type: 'success',
                                            duration: 3000
                                        });
                                        _this.getOrderInfo();
                                        _this.dialogClose();
                                    } else {
                                        this.$notify({
                                            title: res.msg,
                                            message: '',
                                            type: 'error',
                                            duration: 5000
                                        });
                                    }
                                })
                                .catch(() => {});
                        } else {
                            return false;
                        }
                    })
                }else {
                    this.$refs['formBox'].validate(valid => {
                        if (valid) {
                            // 修改订单金额
                            const params = {
                                reason_name: this.priceUpdateForm.reason,
                                order_detail_id: Number(this.orderDetailId)
                            };
                            params['order_detail_id'] = Number(this.orderDetailId);
                            if (this.priceUpdateForm.radio === 1) {
                                params['new_price'] = commUtil.numberMul(Number(this.priceAfterDiscount),100);
                            } else {
                                params['new_price'] = commUtil.numberMul(Number(this.priceUpdateForm.price), 100);
                            }
                            const rLoading = this.openLoading();
                            const _this = this;
                            updateOrderDetail(params)
                                .then((res) => {
                                    rLoading.close();
                                    if (res.code === 200) {
                                        this.$notify({
                                            title: '修改成功',
                                            message: '',
                                            type: 'success',
                                            duration: 3000
                                        });
                                        _this.getOrderInfo();
                                        _this.dialogClose();
                                    } else {
                                        this.$notify({
                                            title: res.msg,
                                            message: '',
                                            type: 'error',
                                            duration: 5000
                                        });
                                    }
                                })
                                .catch(() => {});
                        } else {
                            return false;
                        }
                    })
                }
            },

            // 修改订单价格
            handleUpdatePrice(i,row){
                this.orderDetailId = row.id;
                this.dialogTitle = '修改订单价格';
                // 子订单价格 单价*数量
                this.currentPrice = Number(row.price_real_sum);
                const min = 100 - Number(this.MoneyChangeMax);
                const min_price = ((min * this.currentPrice)/10000).toFixed(2);
                this.minPrice = min_price;
                const priceChangeTip = '修改后价格应不低于'+ min_price + '元';
                this.moneyUpdateLabel = '现价（' + priceChangeTip +'）';
                this.$set(this.priceUpdateForm, 'radio', 0);
                this.priceUpdateVisible = true;
            },

            // 弹框关闭前操作
            dialogClose(){
                if (this.dialogTitle === '修改运费') {
                    this.$refs['shippingFormBox'].clearValidate();
                    this.$refs['shippingFormBox'].resetFields();
                    this.shippingUpdateVisible = false;
                }else {
                    this.$refs['formBox'].clearValidate();
                    this.$refs['formBox'].resetFields();
                    this.priceUpdateVisible = false;
                }
            },

            // 修改运费
            updateShipping(){
                this.dialogTitle = '修改运费';
                this.moneyUpdateLabel = '修改后运费'
                this.shippingUpdateVisible = true;
            },

            changeType(){
                this.$set(this.priceUpdateForm,'price', '');
                this.$set(this.priceUpdateForm,'discount', '');
                this.$nextTick(()=>{
                    this.$refs['formBox'].clearValidate();
                });
            },
            discount_num_change() {
                if (this.priceUpdateForm.discount > 10) {
                    this.$set(this.priceUpdateForm, 'discount', 10);
                }
                this.priceAfterDiscount = ((this.currentPrice * this.priceUpdateForm.discount)/1000).toFixed(2);
            },
            discountBlur(){
            },
            formatDate(val) {
                if(val){
                    let dt;
                    if(val.length > 10){
                        dt = new Date(Number(val ));
                    }else {
                        dt = new Date(Number(val) * 1000);
                    }
                    let year = dt.getFullYear(); //年
                    let month = dt.getMonth() +1; //月
                    let date = dt.getDate(); //日
                    let hh = dt.getHours(); //时
                    let mm = dt.getMinutes(); //分
                    let ss = dt.getSeconds(); //秒
                    month = month < 10 ? "0" + month : month;
                    date  = date <10 ? "0" + date : date;
                    hh  = hh <10 ? "0" + hh : hh;
                    mm  = mm <10 ? "0" + mm : mm;
                    ss  = ss <10 ? "0" + ss : ss;
                    let new_time = ''
                    new_time = year + "-" + month + "-" + date + ' ' + hh + ':' + mm + ':' + ss;
                    return new_time;
                }
            },

            /**
             * 部分退款||退运费 操作
             */
            // 按钮 - 打开 部分修改金额/运费 弹框
            handleRebates(i,row){
                this.orderDetailId = row.id;
                this.rebatesDialogTitle = '退款';
                // 退款金额不得高于实付金额
                this.realPay = (row.price_sum_end/100).toFixed(2);
                // console.log('realPay', this.realPay)
                this.rebatesDialogVisible = true;
            },

            // 按钮 - 打开 部分修改金额/运费 弹框
            handleReturnFreight(){
                this.rebatesDialogTitle = '退运费';
                // 退款运费不得高于实付运费
                this.realPay = (this.order_info.logistics_money/100).toFixed(2);
                console.log('realPay', this.realPay)
                this.rebatesDialogVisible = true;
            },

            // 部分退款||运费 弹框关闭
            rebatesDialogClose(){
                this.$refs['rebatesFormBox'].clearValidate();
                this.$refs['rebatesFormBox'].resetFields();
                this.rebatesDialogVisible = false;
            },
            // 按钮 - 确认部分退款/退运费
            handleSureRebates() {
                // params['order_detail_id'] = Number(this.orderDetailId);
                this.$refs['rebatesFormBox'].validate(valid => {
                    if (valid) {
                        const _money = commUtil.numberMul(Number(this.rebatesForm.money),100);
                        const params = {
                            money: _money,
                            reason: this.rebatesForm.reason
                        };
                        const rLoading = this.openLoading();
                        const _this = this;
                        if (this.rebatesDialogTitle === '退款') {
                            params['order_detail_id'] = Number(this.orderDetailId);
                            updateRebatesMoney(params)
                                .then((res) => {
                                    rLoading.close();
                                    if (res.code === 200) {
                                        _this.queryRebatesAPISuccess();
                                    } else {
                                        _this.queryAPIError(res.msg)
                                    }
                                })
                                .catch(() => {});
                        } else { // 退运费
                            params['order_id'] = Number(this.$route.query.order_id);
                            updateRebatesFreight(params)
                                .then((res) => {
                                    rLoading.close();
                                    if (res.code === 200) {
                                        _this.queryRebatesAPISuccess();
                                    } else {
                                        _this.queryAPIError(res.msg)
                                    }
                                })
                                .catch(() => {});
                        }
                    } else {
                        return false;
                    }
                })
            },
            queryRebatesAPISuccess() {
                this.$notify({
                    title: '操作成功',
                    message: '',
                    type: 'success',
                    duration: 3000
                });
                this.getOrderInfo();
                this.rebatesDialogClose();
            },
            queryAPIError(msg) {
                this.$notify({ title: msg, message: '', type: 'error', duration: 5000 });
            },

            // 子订单退款金额记录列表
            getDetailReturnMoney(i,row){
                const params = {
                    order_detail_no: row.order_detail_no.toString()
                }
                const rLoading = this.openLoading();
                queryAfterSaleList(params)
                    .then((res) => {
                        rLoading.close()
                        if (res.code === 200) {
                            this.detailReturnMoneyList = res.data.lists || [];
                            const gv = 'returnMoneyTip-' + row.id
                            this.$refs[gv].click();
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 全选 || 取消全选
            isAllChange(){
                console.log('this.is_all_select', this.is_all_select);
                if(this.is_all_select){
                    this.allList.forEach((ev,i)=>{
                        ev.is_show = true;
                    })
                }else {
                    this.allList.forEach((ev,i)=>{
                        ev.is_show = false;
                    })
                }
                this.$nextTick(()=>{
                    let obj = JSON.stringify(this.allList)
                    localStorage.setItem('orderDetailField', obj)
                })
            },
            itemChange(){
                let new_arr = this.allList.filter((item)=>{return item.is_show});
                console.log('new_arr', new_arr.length)
                if (new_arr.length === this.allList.length) {
                    this.is_all_select = true;
                } else {
                    this.is_all_select = false;
                }
                this.$nextTick(()=>{
                    let obj = JSON.stringify(this.allList)
                    localStorage.setItem('orderDetailField', obj)
                })
            }
        }
    };
</script>
<style lang="less">
    .logistics-timeline-box{
        height: 500px;
        overflow-y: scroll;
        padding: 30px 50px 10px 220px;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        //background: #ccc;
        .el-timeline-item__timestamp.is-bottom{
            position: absolute;
            left: -168px;
            top: 0;
            font-size: 14px;
            height: 20px;
            line-height: 20px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;
            margin-top: 0 !important;
            //line-height: 36px;
        }

        /deep/.el-timeline {
            padding-left: 220px;
            padding-top: 10px;
            height: 100%;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }
        .el-timeline-item__icon{
            font-size: 10px;
            color: #D8D8D8;
        }
        .el-timeline-item__node--normal{
            width: 10px;
            height: 10px;
            background: #D8D8D8;
            left: 0;
        }
        .el-timeline-item__wrapper{
            padding-left: 62px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;
            //line-height: 36px;
        }
        .el-timeline{
            .el-timeline-item:nth-last-child(2) {
                .el-timeline-item__tail{
                    border-left: 2px solid #FAAD14;
                }
            }
        }
    }
</style>
<style>
    .update-list-popover,.logistics-update-list-popover{
        padding: 0!important;
    }
    .update-list-popover{
        transform: translateX(8px);
    }
    .update-list-popover .popover-title, .logistics-update-list-popover .popover-title{
        width: 100%;
        height: 32px;
        line-height: 32px;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        padding-left: 8px;
        border-bottom: 1px solid rgba(0,0,0,.06);
    }
    .update-price-form .el-input{
        width: 300px;
    }
</style>
<style lang="less" scoped>
    .log-wrap{
        width: 100%;
        padding: 24px 0 0;
        /*height: 420px;*/
        min-height: 420px;
        overflow-y: scroll;
        .item-box{
            width: 100%;
            //padding: 15px 0;
            padding-right: 24px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
        }
        .left-box{
            width: 90px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #333333;
            line-height: 20px;
            //padding: 0 10px;
            text-align: right;
            .date{

            }
            .time{

            }
        }
        .center-box{
            position: relative;
            padding: 0 20px;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            .point-wrap{
                position: absolute;
                top: 14px;
                left: 50%;
                transform: translateX(-50%);
                -webkit-transform: translateX(-50%);
                width: 10px;
                height: 10px;
                background: #DCDEE3;
                border-radius: 100%;
            }

            .top-line{
                position: absolute;
                top: 0;
                width: 2px;
                height: 12px;
                background: #DCDEE3;
                //border-radius: 1px;
            }
            .bottom-line{
                position: absolute;
                top: 26px;
                bottom: 0;
                width: 2px;
                flex: 1;
                background: #DCDEE3;
                //border-radius: 1px;
            }
        }
        .right-box{
            width: 270px;
            //height: 239px;
            background: #F4F5F8;
            border-radius: 5px;
            margin: 0 0 30px;
            .line-box{
                width: 100%;
                height: 1px;
                background: #E6E7EB;
            }
            .right-content{
                padding:20px 14px;
                box-sizing: border-box;
                -webkit-box-sizing: border-box;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #333333;
                line-height: 17px;
                .marginTop20{
                    margin-top: 20px;
                }
                .goods-img-title{
                    display: flex;
                    margin-top: 10px;
                    .goods-img{
                        width: 60px;
                        height: 45px;
                        img{
                            width: 100%;
                            height: 100%;
                            display: inline-block;
                            vertical-align: bottom;
                            cursor: pointer;
                            -o-object-fit: cover;
                            object-fit: cover;
                        }
                    }
                    .goods-title{
                        margin-left: 10px;
                        flex: 1;
                    }
                }
                .goods-img-title:first-child{
                    margin-top: 0;
                }
            }
            .padding-14{
                padding-left: 14px;
                padding-rigt: 14px;
                box-sizing: border-box;
                -webkit-box-sizing: border-box;
            }
            .font-class{
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #333333;
                line-height: 17px;
                word-break: break-all;
            }
            .operator{
                width: 100%;
                height: 32px;
                line-height: 32px;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #333333;
            }
            .content-text{
                padding: 12px 10px 15px 14px;
                line-height: 17px;
            }
            .add-del-img-box{
                padding-top: 6px;
                border-bottom: 1px solid #E6E7EB;
            }
            .Leaflet-img{
                display: flex;
                padding: 6px 14px 12px;
                .Leaflet-text{
                    width: 194px;
                    margin-left: 10px;
                    word-break: break-all;
                }
            }
            .padding-0{
                padding: 0;
            }
            .img-wrap{
                padding: 12px 14px 15px;
                .rest-text{

                }
                .existing-img-box{
                    margin-top: 4px;
                }
            }
            .img-item{
                width: 40px;
                height: 40px;
                border-radius: 2px;
                cursor: pointer;
                display: inline-block;
                vertical-align: bottom;
            }
            .existing-img{
                margin: 6px 8px 0 0;
            }
            .replace-img-box{

                .replace-img{
                    width: 40px;
                    height: 40px;
                    border-radius: 2px;
                    cursor: pointer;
                    display: inline-block;
                    vertical-align: bottom;
                }
            }
        }
    }
</style>
