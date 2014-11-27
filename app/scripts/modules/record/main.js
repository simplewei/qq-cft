require(['zepto', 'backbone', 'underscore', 'iscroll', 'widgets/prompt', 'widgets/wxLogin', 'widgets/loading', 
	'text!modules/record/templates/record.html'],
	function($, Backbone, _, IScroll, prompt, wxLogin, loading, recordTpl) {

		loading.show();

		var iscroll =new IScroll('#wrapper', {tap:true, click:true, probeType: 2, mouseWheel: true});

		wxLogin.login().then(function(data){

		// 页面路由
			var AppRouter = Backbone.Router.extend({
				routes: {
					'': 'main',
					'detail/:id': 'detail'
				},
				main: function() {
					loading.show();
					showRecords();
				},
				detail: function(id) {
					loading.show();
					showDetail(id);
				}
			});
			var router = new AppRouter();



		/*
		 * 展示所有记录
		 * trans_detail.cgi 查询护照、退税单信息
		 * 参数：
		 * type 必须，0 护照； 1 退税单
		 * limit 可选		本次查询个数，用于翻页（默认最大）
		 * offset 可选	本次查询起点，用于翻页（默认0）
		 * 返回值：
		 * 	0 成功，并包含详情
		 * 	其它失败
		 */

		 var showRecords= function(){
		 	
		 	$.ajax({
				url: '/cgi-bin/v1.0/trans_detail.cgi',
				data:{
					type: 1
				},
				cache: false
			}).then(function(data) {
				loading.hide();
				if(data.retcode === 0){
					if(!data.bill){
						$('.container').empty().append('<div class="no-record">您没有退税记录</div>');
						return;
					}
					var _html = _.template(recordTpl)(data);
					
					// var $records = $(_html).appendTo($('.container').empty());
					$('.container').empty().append(_html).children().first()
					.one('tap', '.detail-line', function(){						
						location.href = '#detail/'+$(this).attr('_id');
						$records= undefined;
					});
					iscroll.refresh();
					
				}else if(data.retcode === 20003){
					prompt('对不起，没有查到您的订单记录');
				}
			}, prompt.error);
		 };

		 /*
		  * tax_info.cgi 获取指定订单、护照的详情
		  * 参数：
		  * type 2 护照ID； 3 订单ID
		  * code 护照或订单的id
		  * 返回值：
		  * 0 成功，并包含详情passport、bill段
		  * 其它失败
		  */
		 var showDetail = function(id){
		 	$.ajax({
				url: '/cgi-bin/v1.0/tax_info.cgi',
				data:{
					type: 3,
					code: id
				},
				cache: false
			}).then(function(data) {
				
				require(['text!modules/record/templates/detail.html'],function(detailTpl){
					
					loading.hide();
					if(data.retcode === 0){
						var _html = _.template(detailTpl)(data);

						$('.container').empty().append(_html).children().first()
							.on('tap', '.cancel', function(){
								cancelOrder(data.bill[0]['id']);
							});
						iscroll.refresh();
					} else{
						prompt.error();
					}
				})

			}, prompt.error);
		 };


		/*
		 * bill_mgr.cgi 修改订单状态
		 * 参数：
		 * id 必选，订单id
		 * type 必选，类型，目前为零，取消订单
		 */
		 var cancelOrder = function(id){
		 	loading.show()
		 	$.ajax({
		 		url: '/cgi-bin/v1.0/bill_mgr.cgi',
		 		data:{
		 			type: 0,
		 			id: id
		 		}
		 	}).then(function(data){
		 		loading.hide();
		 		if(data.retcode === 0)
		 			location.reload();
		 		else
		 			prompt.error();
		 	});
		 };

		 Backbone.history.start();

	})

})