require(['zepto', 'backbone', 'underscore', 'iscroll', 'queryString', 'widgets/wxLogin',
 'widgets/wxAddress', 'widgets/loading','widgets/prompt', 'modules/apply/user', 'modules/my/passports',
 'text',  'widgets/ajaxSettings'],
	function($, Backbone, _, IScroll, queryString, wxLogin, wxAddress, loading, prompt, user, passports) {

		
		var options = {
		  click: true,
		  tap: true,
		  disableMouse: true,
		  mouseWheel: true
		};
		
		var iscroll = new IScroll('#wrapper', options);
		loading.show();
		wxLogin.login().then(function(data) {

			// 页面路由
			var AppRouter = Backbone.Router.extend({
				routes: {
					'': 'main',
					'signup': 'signup',
					'user': 'user',
					'validate/:id': 'validate',
					'passport': 'addPassport',
					'passport/:passport': 'modiPassport',
					'passports': 'passports',
					'passports/:prms': 'passports',
					'receipt/:passports': 'receipt',
					'agreement': 'agreement',
					'success/:type': 'success',
					'*error': 'renderError'
				},

				main: function() {
					valiUser();
				},

				// 新手指引：显示注册提示页面，点击下一步进入注册
				signup: function(){
					loading.hide();
					new user.guide({
						iscroll: iscroll
					});
				},

				user: function() {

					new user.userView({
						iscroll: iscroll
					});
					loading.hide();
					
				},

				validate: function(userInfo) {
					$('header').remove();
					$('#wrapper').css('top', null);
					new user.validate({
						userInfo:userInfo,
						iscroll:iscroll,
						redirect_url: '#passports'
					});
					loading.hide();					
				},

				/*
				 * 单个护照新增、修改
				 * data包含 type、以及其他护照信息
				 * type（前端页面路由间自行约定操作方式，默认：0）:
				 * 0 新增
				 * 1 修改
				 */
				addPassport: function() {
					
					document.title = '添加护照信息';
					
					require(['modules/my/passport'], function(passport){				
						
						passport.startup({
							iscroll: iscroll
						});
					});
				},
				modiPassport: function(data) {
					
					require(['modules/my/passport'], function(passport){
						passport.startup($.extend(JSON.parse(data), {
							iscroll: iscroll
						}));
					});
				},

				passports: function(prms) {
					
					document.title = '选择退税人护照';
					prms = prms||'{}';
					prms = JSON.parse(prms);
					var that = this;
					this.currentView && this.currentView.clear();					
					that.currentView = new passports({
						iscroll: iscroll,
						selected: prms.selected,
						type: 1
					});
					loading.hide();					

				},
				receipt: function(passports) {
					
					document.title = '单据填写';
					showReceipt(JSON.parse(passports));
				},
				agreement: function() {
					require(['text!modules/apply/templates/agreement.html'], function(aTemp) {
						$('.container').empty().append(aTemp);
						iscroll.refresh();
					});
				},
				// 返回 type  0 个人退税 ;  1 授权退税
				success: function(type) {
					document.title = '提交申请成功';
					showSuccess(type);
				},
				renderError: function(error) {
					console.log('URL错误, 错误信息: ' + error);
				}
			});

			var router = new AppRouter();

			/*
			 * 页面初始化、判断是否登记过申请人信息
			 *
			 * user_login.cgi 判断用户是否已经注册（绑定手机号）
			 * 参数：无
			 * 返回：
			 * 10002  尚未登陆
			 * 0	  当前账号已绑定手机号码
			 * 20003 当前账号尚未绑定手机号
			 * 其它非零错误码，提示系统繁忙
			 */
			var valiUser = function() {
				$.ajax({
					url: '/cgi-bin/v1.0/user_login.cgi',
					cache: false
				}).then(function(data) {
					if (data.retcode === 0) {
						router.navigate('#passports', {
							trigger: true,
							replace: true
						});
					}
				});
			};



			/**
			 * 展示单据填写页
			 */
			var showReceipt = function(passports) {
				require(['text!modules/apply/templates/receipt.html'], function(receiptTpl) {
					var _html = _.template(receiptTpl)();
					var $receipt = $(_html).appendTo($('.container').empty());
					iscroll.refresh();
					// var cArea = chinaArea.init("province", "city", "district");
					
					// 自动为用户填充地址
					loading.show();
					$.ajax({
						url: '/cgi-bin/v1.0/user_base.cgi',
						cache: false
					}).then(function(data) {
						loading.hide();
						data.user = data.user||{};
						data.user.addr = data.user.addr||'';
						$('.address-line').val(data.user.addr);
						// var adrrArr =  data.user.addr.split(' ');
						// cArea.set(adrrArr.slice(0, 3));
						// $('.addr').val(adrrArr.slice(3).join(' '));
					},function(){loading.hide();});

					// 事件绑定
					$receipt.on('tap', '.submit', function() {
						
						// 点击后立即禁用按钮
						if($(this).hasClass('btn-disable'))
							return;
						$(this).addClass('btn-disable');

						var data = {}
						$('input,select,textarea', '.container').filter('[name]').each(function() {
							data[this.name] = this.value;
						});
						saveReceipt(data, passports);
					}).on('tap', '.checkbox-line .checkbox', function() {
						if ($(this).toggleClass('on').hasClass('on')) {
							$('.submit').removeClass('btn-disable');
						} else {
							$('.submit').addClass('btn-disable');
						};
					}).on('change', '.nation', function(){
						var b = ['阿根廷','丹麦','韩国','葡萄牙','英国','乌拉圭'].indexOf($(this).val());
						if (b === -1) {
							$('.ticket').show();
						}else{
							$('.ticket').hide();
						};
					}).on('tap', '.address-line', function() {

						wxAddress.editAddress().then(function(res){
							if(res.proviceFirstStageName){
								var addr = res.proviceFirstStageName + ' ' +
								res.addressCitySecondStageName + ' ' +
								res.addressCountiesThirdStageName + ' ' +
								res.addressDetailInfo;
								$('.address-line').val(addr);
							}
							
						});
					});
				})
			}

			/**
			 * 保存单据
			 * submit_bill.cgi 提交退税单
			 * 参数：
			 * nation 国家码
			 * passport 护照信息，passport = [{"id":123},{"id":2134"}]
			 * deliver 递送方式，deliver =｛"billid":0, "type":1, "shop_id":"","name":"", "addr":"","phone":""｝
			 * 其中：
			 * billid，可选
			 * type 0， 亲自到店；1，邮递到门店；2，快递上门
			 * shop_id, 门店编码
			 * name/addr/phone，快递时有效
			 */
			var saveReceipt = function(formData, passports) {

				if(!formData.addr){
					prompt.alert('请输入详细地址');
					return;
				};

				loading.show();
				$.ajax({
					url: '/cgi-bin/v1.0/submit_bill.cgi',
					data: {
						nation: formData.nation,
						passport: JSON.stringify(passports),
						deliver: JSON.stringify({
							type: 2,
							addr: formData.addr
						})
					},
					cache: false
				}).then(function(data) {
					loading.hide();
					if (data.retcode === 0) {
						location = '#success/' + JSON.stringify({type: data.bill.type});
					}
				});
			};


			/**
			 * 显示成功页
			 */
			var showSuccess = function(prms) {
				prms = JSON.parse(prms);
				require(['text!modules/apply/templates/success.html'], function(successTemp) {
					var _html = _.template(successTemp)(prms);
					$('.container').empty().append(_html);
					iscroll.refresh();
				})
			}


			Backbone.history.start();
		});

});