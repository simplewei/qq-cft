/*
 * 单个护照管理
 *
 * 护照管理: 增 删  改
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

define(['zepto', 'backbone', 'underscore', 'queryString', 'widgets/loading',
		'text!modules/my/templates/passport.html'
	],
	function($, Backbone, _, queryString, loading, ppTpl) {


		var PassportModel = Backbone.Model.extend({
			// 设置默认的属性
			defaults: {
		  			last_name_en: '',
		  			first_name_en: '',
		  			last_name_cn: '',
		  			first_name_cn: '',
		  			nation: '',
		  			no:'',
		  			type: 0
		  		},

			save: function() {

			},

			delete: function() {

			},

			// 下一步 申请时才有
			next: function() {
				this.save({
					done: !this.get("done")
				});
			}

		});

		var PassportView = Backbone.View.extend({

			//下面这个标签的作用是，把template模板中获取到的html代码放到这标签中。
			// tagName: "div",

			// 获取一个任务条目的模板,缓存到这个属性上。
			template: _.template(ppTpl),

			model: new PassportModel(),

			// el: iscroll.scroller,

			// 为每一个任务条目绑定事件
			events: {

				'tap .add-passport-line': 'add',
				'tap .ico-edit': 'edit',
				'tap .main-title,.sub-title,.checkbox': 'select',

				'tap .submit': 'goNext'
			},

			initialize: function(prms) {
				
				this.listenTo(this.model, 'change', this.render);
				this.iscroll = prms.iscroll;
				this.$el.appendTo(this.iscroll.scroller);
				this.render();
			},

			render: function(context) {

				//加载模板到对应的el属性中
				this.$el.html(this.template(this.model.toJSON()));
				this.iscroll.refresh();
			},
			
			// 新增护照			  				
			add: function() {
				location.href = '#addPassport'
			},

			edit: function() {
				// 修改护照

				var _node = $(this).parents('.title-line')[0],
					index;
				$('.title-line').each(function(i, node) {
					if (_node == node)
						index = i;
				});
				location.href = '#addPassport/' + JSON.stringify($.extend({
					type: 1
				}, data.passport[index]));
			},



			delete: function() {

			},

			goNext: function() {
				
			}
		});

		return PassportView;

	});