/*
 * 个人中心入口js，实现路由绑定
 * 分别有 护照管理、个人信息管理
 *
 */

require(['zepto', 'backbone', 'underscore', 'iscroll', 'queryString', 'widgets/wxLogin', 'widgets/loading',
	'modules/my/passports', 'modules/my/passport', 'widgets/ajaxSettings'],
	function($, Backbone, _, IScroll, queryString, wxLogin, loading, passports, passport) {


	wxLogin.login().then(function(data){

	var iscroll = new IScroll('#wrapper', {tap:true, click:true, probeType: 2});

	var AppRouter = Backbone.Router.extend({
		routes: {
			'': 'passports',
			'myPassports': 'passports',
			'passport/:passport': 'modPassport',			
			'passport': 'addPassport',
			'*error': 'renderError'
		},
		passports: function(){
			
			this.currentView&& this.currentView.clear();
			this.currentView = new passports({
				iscroll: iscroll
			});
			
		},
		modPassport:function(data){
			passport.startup($.extend(JSON.parse(data), {
				iscroll: iscroll
			}));
		},
		addPassport: function(){
			passport.startup({
				iscroll: iscroll
			})
		},
		renderError:function(){

		}
	})
	var router = new AppRouter();
	Backbone.history.start();
})
});