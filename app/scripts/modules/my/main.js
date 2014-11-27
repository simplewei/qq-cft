/*
 *
 *
 *
 */

require(['zepto', 'backbone', 'underscore', 'iscroll', 'widgets/wxLogin', 'widgets/loading', 
	'widgets/validate', 'widgets/wxAddress', 'widgets/prompt', 'text', 'text!modules/my/templates/info.html'
	],
	function($, Backbone, _, IScroll, wxLogin, loading, validate, wxAddress, prompt, text, infoTemp) {

		var iscroll = new IScroll('#wrapper', {
			tap: true,
			click: true,
		  	disableMouse: true,
			probeType: 2
		});
		loading.show();
		wxLogin.login().then(function(data) {

		// 页面路由
		var AppRouter = Backbone.Router.extend({
			routes: {
				'': 'vali',
				'signup': 'signup',
				'user': 'user',
				'validate/:id': 'validate',
				'*error': 'renderError'
			},
			vali: function() {
				$.ajax({
					url: '/cgi-bin/v1.0/user_login.cgi',
					cache: false
				}).then(function(data) {
					if (data.retcode === 0) {
						startup();
					} else if (data.retcode === 20003) {
						router.navigate('#signup', {
							trigger: true,
							replace: true
						});
					} else{
						prompt.error();
					}
				}, prompt.error);
			},

			main: function(){
				
			},


			// 新手指引：显示注册提示页面，点击下一步进入注册
			signup: function(){
				loading.hide();
				require(['modules/apply/user'], function(user) {
					new user.guide({
						iscroll: iscroll
					});
				});
			},

			user: function() {
				
				this.currentView && this.currentView.clear();
				require(['modules/apply/user'], function(user) {

					new user.userView({
						iscroll: iscroll
					});
					loading.hide();
				});
			},
			validate: function(userInfo) {
				require(['modules/apply/user'], function(user) {						
					new user.validate({
						userInfo:userInfo,
						iscroll:iscroll,
						redirect_url: '#main'
					});
					loading.hide();
				});
			}
		});
		var router = new AppRouter();


		
			/*
			 * user_base.cgi 获取用户基本信息
			 {
				"msgid": "14110314606B29850A21520",
				"retcode": 0,
				"retmsg": "ok",
				"user": {
					"addr": "",
					"birthday": "",
					"cre_id": "340321198301115956",
					"cre_type": 0,
					"email": "",
					"id": 6,
					"mobile": "13480932573",
					"name": "韩春广",
					"post_code": ""
				}
			  }
	
			 * user_mgr.cgi 修改当前用户的附加信息
			 *	参数：
			 *	sex   性别，取值范围0（男）或 1（女）
			 *	birthday 生日， YYYYMMDD格式
			 *	email  电子邮件
			 *	addr   地址
			 * 返回值：
			 *	0 成功，修改的用户信息
			 *  其它失败
			 */
			var startup = function(){
				$.ajax({
					url: '/cgi-bin/v1.0/user_base.cgi',
					cache: false
				}).then(function(data) {
					
					loading.hide();

					data = $.extend({
						user: {}
					}, data);
					data.user.addr = data.user.addr||'';

					var _html = _.template(infoTemp)(data);

					$('.container').empty().append(_html).children().first()
					.on('tap', '.submit', function() {
						saveInfo();
					}).on('tap', '.address-line', function() {
						wxAddress.editAddress().then(function(res){
							if(res.proviceFirstStageName){
								var addr = res.proviceFirstStageName + ' ' +
								res.addressCitySecondStageName + ' ' +
								res.addressCountiesThirdStageName + ' ' +
								res.addressDetailInfo;
								$('.address-line').val(addr);
							};
						});
					});

					iscroll.refresh();
				});
			}


			var valiFunc = function(data){
				if(!data.addr){
					prompt.alert('详细地址不能为空');
				}else if(data.birthday && !validate.checkDate(data.birthday)){
					prompt.alert('生日日期填写不正确，请检查');
				}else if(data.email && !validate.checkEmail(data.email)){
					prompt.alert('邮箱填写不正确，请检查');
				}else{
					return true;
				}
			}

			var saveInfo = function(){
				var formData = {}
				$('input,select,textarea', '.container').filter('[name]').each(function() {
					formData[this.name] = this.value;
				});
				if(!valiFunc(formData))
					return;
				loading.show();
				$.ajax({
					url: '/cgi-bin/v1.0/user_mgr.cgi',
					data: formData,
					cache: false
				}).then(function(data) {
					loading.hide();
					if(data.retcode === 0)
						prompt.alert('保存成功');
					else
						prompt.error();
				},prompt.error);
			};

			Backbone.history.start();
		});
	});