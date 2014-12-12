/*
 * 微信收货地址
 *
 * 经验证，无法使用中转页面来调用微信收货地址JS-api，
 * 一进入页面立即调用获取code
 *
 * author: simplewei
 * date: 2014-10-23
 */

define(['zepto', './loading'], function($, loading) {


	var exports ={};

	exports.editAddress = function(){
		var deferred = new $.Deferred();
		loading.show();

		var _url = location.href;

		// IOS版微信在调用地址接口时忽略了锚点，造成鉴权失败
		// 我们暂用不包含锚点url去生产token
		// 2014-11-03
		if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) && location.hash){
			_url = _url.slice(0, _url.indexOf(location.hash));
		};
		$.ajax({
			url: '/cgi-bin/v1.0/addr_token.cgi',
			data: {
				url: _url
			},
			cache: false
		}).then(function(data) {
			loading.hide();
			if(data.retcode === 10002){
				require(['widgets/wxLogin'],function(login){
					login.OAuthLogin();
				});
				return;
			};
			WeixinJSBridge.invoke("editAddress", data.token, function(res) {
				deferred.resolve(res);
			});
			
		});
		return deferred;
	};

	return exports;
});