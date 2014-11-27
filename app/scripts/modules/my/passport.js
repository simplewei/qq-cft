

define(['zepto', 'backbone', 'underscore',  'queryString', 'widgets/loading', 'widgets/prompt', 
		'text!modules/my/templates/passport.html'
	],
	function($, Backbone, _ , queryString, loading, prompt, ppTpl) {

		var exports = {};

		/*
		 * 添加\修改 护照
		 *
		 */
		exports.startup = function(prms) {

			var iscroll =  prms.iscroll;
			delete prms.iscroll;

				prms.info = $.extend({
		  			last_name_en: '',
		  			first_name_en: '',
		  			last_name_cn: '',
		  			first_name_cn: '',
		  			nation: '',
		  			no:''
		  		}, prms.info);
		  		
				var _html = _.template(ppTpl)(prms.info);
				// var $add = $(_html).appendTo($('.container').empty());
				$('.container').empty().append(_html).children().first()
				.on('tap', '.submit', function() {
					var data = {}
					
					$('input,select').filter('[name]').each(function(index, input){
						data[this.name] = this.value;
					});
					prms.info = $.extend(prms.info, data)
					exports.savePassport(prms);

				}).on('tap', '.delete', function() {
					var data = {}
					$('input,select').filter('[name]').each(function(index, input) {
						data[this.name] = this.value;
					});

					exports.delPassport($.extend(prms.info, data));

				}).on('tap', '.checkbox-line', function() {
					$(this).find('.checkbox').toggleClass('on');
				});

				iscroll.refresh();
			
		};



		var validate= function(data) {
				String.prototype.getBytes = function() {
					var cArr = this.match(/[^x00-xff]/ig);　　
					return this.length + (cArr == null ? 0 : cArr.length);　　
				}
				if(!data.no){
					prompt.alert('请输入护照号');
				} else if (!(data.first_name_en+ data.last_name_en)){
					prompt.alert('请输入英文名');
				} else if (!(data.first_name_cn+ data.last_name_cn)){
					prompt.alert('请输入中文名');
				} else
					return true;
		};


		/**
		 * 保存单个护照
		 * 此处同时包含 新增、修改2种场景，根据是否带id判断
		 *
		 * passport_mgr.cgi 护照增删改查
		 * 参数：
		 * cmd 必选， 取值范围：0,新增；1，删除；2修改
		 * data 必选， 形如：data=[{},{},{}]
		 * 其中
		 * id 护照内部号码，整数
		 * no 护照号码，字符串
		 * nation 国家，字符串
		 * first_name_en 英文名
		 * last_name_en 英文名
		 * first_name_cn 中文名
		 * last_name_cn 中文名
		 */
		exports.savePassport = function(prms) {
			if(!validate(prms.info))
				return;

			prms.selected = prms.selected||[];
			var tempPassport = {no: prms.info.no};
			// TODO
			prms.selected.push(tempPassport);

			loading.show();
			$.ajax({
				url: '/cgi-bin/v1.0/passport_mgr.cgi',
				data: {
					cmd: prms.info.id=== undefined? 0: 2,
					data: JSON.stringify([prms.info])
				},
				cache: false
			}).then(function(data) {
				loading.hide();
				if(data.retcode == 0)
					location.href = '#passports/'+ JSON.stringify({
						selected: prms.selected
					});
			});
		};

		exports.delPassport = function(data) {
			loading.show();
			$.ajax({
				url: '/cgi-bin/v1.0/passport_mgr.cgi',
				data: {
					cmd: 1,
					data: JSON.stringify([data])
				},
				cache: false
			}).then(function() {
				loading.hide();
				location.href = '#passports'
			});
		};

		return exports;

	})