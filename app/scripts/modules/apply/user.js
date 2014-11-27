/*
 * 展示手机短信验证页面
 *
 * 1. 下发短信验证码
 * send_sms_v.cgi  下发短信验证码
 * 参数：
 * mobile  必选，手机号码
 * name    必选，用户姓名
 * 返回值：
 *	0  成功
 *	其它 失败
 *
 * 2. 用户提交验证码
 * user_signup.cgi 用户注册（绑定手机号）
 * 参数：mobile=&name=&cre_type=&cre_id=&verify_code=
 * mobile 必选，手机号码
 * name  必须，用户姓名
 * cre_type 必选，证件类型，目前取值（0，身份证；1 护照）
 * cre_id  必须，证件号码
 * verify_code 条件必选，即下发的手机验证码
 * 返回值：
 *	0 成功
 *	其它 失败
 */
define(['zepto', 'backbone', 'underscore', 'queryString', 'widgets/loading',
		'widgets/validate',
		'widgets/prompt', 'text!modules/apply/templates/guide.html',
		'text!modules/apply/templates/userInfo.html',
		'text!modules/apply/templates/validate.html'
	],
	function($, Backbone, _, queryString, loading, validate, prompt, guideTpl, userTpl, valiTpl) {



		var UserView = Backbone.View.extend({

			//下面这个标签的作用是，把template模板中获取到的html代码放到这标签中。
			// tagName: "div",

			// 获取一个任务条目的模板,缓存到这个属性上。
			template: _.template(userTpl),

			// 为每一个任务条目绑定事件
			events: {
				"tap .submit": "submit"
			},

			initialize: function(prms) {
				this.iscroll = prms.iscroll;
				this.render();
			},

			render: function() {
				$(this.iscroll.scroller).empty().append(this.$el);
				this.$el.append(this.template());
				this.iscroll.refresh();
			},

			/*
			 * 用户输入校验
			 * 姓名：		<= 50 字符
			 * 证件类型：	身份证、护照
			 * 证件类型：	身份证、护照、港澳通行证、台胞证
			 * 证件号：		现有证件号码规则，可参考航旅机票预订
			 */
			validate: function(formData) {
				String.prototype.getBytes = function() {
					var cArr = this.match(/[^x00-xff]/ig);　　
					return this.length + (cArr == null ? 0 : cArr.length);　　
				}
				if(!formData.name){
					prompt.alert('请输入证件号');
				} else if (!formData.mobile){
					prompt.alert('请输入手机号');
				} else if (!formData.cre_id){
					prompt.alert('请输入证件号');
				} else if (formData.name.getBytes() > 50) {
					prompt.alert('姓名输入需小于50字符');
				} else if (formData.cre_type == 0 && !validate.checkID18(formData.cre_id)) {
					prompt.alert('身份证号码输入有误，请检查')
				} else if (!validate.checkMobile(formData.mobile))
					prompt.alert('错误的手机号码，请检查')
				else
					return true;

			},

			submit: function() {
				
				var formData = {
					redirect_url: this.redirect_url
				};
				$('input, select', '.container').filter('[name]').each(function(index, input) {
					formData[this.name] = this.value;
				});

				if (this.validate(formData))
					location.href = '#validate/' + queryString.stringify(formData);
			}
		});


		var ValidateView = Backbone.View.extend({

			//下面这个标签的作用是，把template模板中获取到的html代码放到这标签中。
			// tagName: "div",

			// 获取一个任务条目的模板,缓存到这个属性上。
			template: _.template(valiTpl),


			// 为每一个任务条目绑定事件
			events: {
				"tap .submit": "submit"
			},

			initialize: function(prms) {

				this.user = queryString.parse(prms.userInfo);
				this.redirect_url = prms.redirect_url;
				this.sendMessage();

				this.iscroll = prms.iscroll;
				this.render();
				this._setInterval();
			},

			render: function(context) {

				$(this.iscroll.scroller).empty().append(this.$el);
				this.$el.append(this.template(this.user));
				this.iscroll.refresh();

				
			},

			// 60秒后，用户可重新获取验证码
			_setInterval : function(){
				var that = this;
				var _t = setInterval(function(){
					var s = this.$('.seconds').text();
					s--;
					if(!s){
						clearInterval(_t);
						this.$('.seconds').text('重新获取验证码&nbsp;&nbsp;&nbsp;&nbsp;').on('click',function(){
							that.sendMessage({bak_port: 1});
							$(this).text(59).parent().removeClass('btn-green');
							that._setInterval();
						}).parent().addClass('btn-green');
					}else
						this.$('.seconds').text(s).off();
				},1000);
			},

			// 发送短信

			sendMessage: function(prms) {
				$.ajax({
					url: '/cgi-bin/v1.0/send_sms_v.cgi',
					data: $.extend({
						mobile: this.user.mobile,
						name: this.user.name
					}, prms),
					cache: false
				})
			},

			validate: function(numb) {
				return true;
			},

			submit: function() {
				loading.show();
				var that = this;
				$.ajax({
					url: '/cgi-bin/v1.0/user_signup.cgi',
					data: $.extend(this.user, {
						verify_code: $('#verify_code').val()
					}),
					cache: false
				}).then(function(data) {
					loading.hide();
					if (data.retcode === 0) {
						location = that.redirect_url;
					};
				})
			}
		});


		var guideView= Backbone.View.extend({

			
			// 获取一个任务条目的模板,缓存到这个属性上。
			template: _.template(guideTpl),


			// 为每一个任务条目绑定事件
			events: {
				"tap .submit": "submit"
			},

			initialize: function(prms){
				$(prms.iscroll.scroller).empty().append(this.$el);
				this.$el.append(this.template());
				prms.iscroll.refresh();
			},

			submit: function(){
				location.href = '#user'
			}
		});


		return {
			guide: guideView,
			userView: UserView,
			validate: ValidateView
		};

	})