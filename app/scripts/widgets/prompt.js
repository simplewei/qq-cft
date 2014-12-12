/**
 * 系统提示，替代、拓展原生alert
 *
 */
 
define(['zepto', 'underscore'],function($, _){
	
	var exports = {};

	var _template = 
	'<div class="pop-tips">'+
		'<div class="pop-tips-cnt">'+
			'<div class="pop-tips-line"><%- context %></div>'+
			'<% _.each(btns, function(btn){ %><a href="javascript:;" class="pop-tips-btn"><%- btn.value %></a><% }) %>'+
		'</div>'+
	'</div>';

	var deferred = new $.Deferred;

	exports.init = function(params){
		params = $.extend({
			context: '',
			btns:[{
				value: '确定'
			}]
		},params);
		$(document.body).blur();
		var _html = _.template(_template)(params);
		$(document.body).append(_html);
	};

	exports.alert = function(context){
		deferred = new $.Deferred;
		exports.init({context: context});
		return deferred;
	};

	exports.error = function(){
		exports.init({context: '抱歉！页面出现了错误，请刷新重试或与我们的公众号联系'})
	};

	$(document.body).on('click', '.pop-tips-btn', function(){
		$(this).parents('.pop-tips').remove();
		deferred.resolve();
	});

	return exports;

})