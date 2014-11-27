/*
 * 护照管理
 *
 * 护照管理: 2种场景，提交申请过程中、个人中心
 *
 * 展示所有护照，供选择
 *
 * trans_detail.cgi 查询护照、退税单信息
 * 参数：
 * type 必须，0 护照； 1 退税单
 * limit 可选		本次查询个数，用于翻页（默认最大）
 * offset 可选	本次查询起点，用于翻页（默认0）
 * 返回值：
 * 	0 成功，并包含详情
 * 	其它失败
 */

define(['zepto', 'backbone', 'underscore', 'queryString', 'widgets/loading', 'widgets/prompt',
		'text!modules/my/templates/passports.html', 'text!modules/my/templates/passports-item.html'
	],
	function($, Backbone, _, queryString, loading, prompt, ppsTpl, ppsItTpl) {


		var PassportModel = Backbone.Model.extend({
			defalt: {
				done: false,
				nation: '',
				no: '',
				first_name_en: '',
				last_name_en: '',
				type: 0
			},
			// 通过方法覆盖，禁用backbone sync
			sync: function() {},

			select: function() {
				this.set({
					done: true
				});
			},

			toggle: function() {
				this.set({
					done: !this.get("done")
				});
			}
		});

		var PassportView = Backbone.View.extend({

			//下面这个标签的作用是，把template模板中获取到的html代码放到这标签中。
			// tagName: "div",

			// 获取一个任务条目的模板,缓存到这个属性上。
			template: _.template(ppsItTpl),

			className: 'title-line',


			// 为每一个任务条目绑定事件
			events: {
				'tap .ico-edit': 'edit',
				'click .main-title,.sub-title,.checkbox': 'toggle'
			},

			initialize: function() {
				this.listenTo(this.model, 'change', this.render);
				this.listenTo(this.model, 'destroy', this.remove);
				this.render();
			},

			render: function(context) {

				//加载模板到对应的el属性中
				this.$el.html(this.template(this.model.toJSON()));

			},
			edit: function() {
				// 修改护照
				var selected =  Passports.done().map(function(pp){
					return {
						no: pp.get('no')
					};
				});
				location.href = '#passport/'+ JSON.stringify({
					info: this.model.toJSON(),
					selected : selected
				});
			},
			toggle: function(context) {
				
				this.model.toggle();
			}
		})

		var PassportCollection = Backbone.Collection.extend({

			model: PassportModel,


			// 自定义方法，查询所有护照信息
			fetchData: function() {
				var that = this;
				loading.show();
				return $.ajax({
					url: '/cgi-bin/v1.0/trans_detail.cgi',
					data: {
						type: 0
					},
					cache: false
				}).then(function(data) {
					loading.hide();
					if (data.retcode === 0) {
						
						that.add(data.passport)
					};
				});
			},

			// 查询所有被用户选择的护照（打√的）
			done: function() {
				return this.where({
					done: true
				});
			}

		});

		var Passports = new PassportCollection();

		var PassportsView = Backbone.View.extend({


			// 获取一个任务条目的模板,缓存到这个属性上。
			template: _.template(ppsTpl),


			// 为每一个任务条目绑定事件
			events: {
				'tap ': 'all',
				'tap .add-passport-line': 'add',
				'tap .submit': 'goNext',
				'tap .delete': 'delete'
			},

			/*
			 * prms:	--	type		展现形式:0, 1 (默认0)
			 * 			--	iscroll		全局iscroll (必选)
			 *			--	selected	已选中的护照 [{id:xx},...] (可选)
			 *
			 *	模块有两种展现形式，通过type区别：
			 *	0: 个人中心的护照管理
			 *	1: 申请过程中的护照选择页
			 */
			initialize: function(prms) {

				this.prms = prms;
				this.iscroll = prms.iscroll;

				this.listenTo(Passports, 'add', this.addOne);
				this.listenTo(Passports, 'change', this.rerender);
				// all 所有事件都会触发
				// this.listenTo(Passports, 'all', this.render);
				this.render(prms.type);
				var that = this;

				// 如果url上有需要选中护照的参数就执行选中
				// 如果没有就默认选中第一个
				Passports.fetchData().then(function(){
					if(prms.selected)
						that.select(prms.selected);
					else
						that.selectByIndex(0);
				});
				
			},

			all: function(evt){
				
			},

			render: function(type) {
				// TODO 避免内存泄露
				$(this.iscroll.scroller).empty();

				//加载模板到对应的el属性中
				this.$el.appendTo(this.iscroll.scroller);
				this.$el.html(this.template({
					type: type
				}));
				this.iscroll.refresh();
			},

			/*
			 * 根据护照号，从collection中遍历寻找符合条件的model，并调用其select
			 */
			select: function(selected){

				var selectedPassports = [];
				Passports.each(function(pp){
					$.each(selected, function(){
						if(this.no === pp.get('no'))
							selectedPassports.push(pp);
					});
				});
				_.invoke(selectedPassports, 'select');
			},

			// 根据次序选中护照
			selectByIndex: function(i){
				var fst = Passports.first();
				fst&& fst.select();
			},

			addOne: function(passport) {
				passport.set('type', this.prms.type)
				var view = new PassportView({
					model: passport
				});
				this.$(".mlines").append(view.el);
			},


			rerender: function() {

				if (Passports.done().length)
					this.$('.btn-green').removeClass('btn-disable');
				else
					this.$('.btn-green').addClass('btn-disable');

			},

			// 新增护照			  				
			add: function() {
				var selected = Passports.done().map(function(pp){
					return {
						no: pp.get('no')
					}
				});
				location.href = '#passport/'+ JSON.stringify(selected);
			},

			goNext: function(evt) {
				if ($(evt.target).hasClass('btn-disable'))
					return;
				var selectedPassports = Passports.done().map(function(pp){
					return {
						id: pp.get('id')
					}
				});
				location.href = '#receipt/' + JSON.stringify(selectedPassports);
			},

			delete: function(evt) {

				if ($(evt.target).hasClass('btn-disable'))
					return;
				var selectedPassports = [];
				Passports.each(function(pp) {
					if (pp.get('done'))
						selectedPassports.push(pp);
				});
				loading.show();
				$.ajax({
					url: '/cgi-bin/v1.0/passport_mgr.cgi',
					data: {
						cmd: 1,
						data: JSON.stringify(selectedPassports)
					},
					cache: false
				}).then(function() {
					loading.hide();
					_.invoke(Passports.done(), 'destroy');
				});

			},

			// 销毁所有模型, 避免内存泄漏
			clear: function() {
				_.invoke(Passports.toArray(), 'destroy');
			}
		});

		return PassportsView;

	});