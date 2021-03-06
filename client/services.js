/**
 * Created by beiwp on 2016/6/22.
 */
'use strict';

mainApplicationModule

    .service('fileReader', ["$q", "$log", function ($q, $log) {
        var onLoad = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };
        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };
        var getReader = function (deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            return reader;
        };
        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };
        return {
            readAsDataUrl: readAsDataURL
        };
    }])


    .service('baseService', ['$http', 'Upload',
        function ($http, Upload) {
            var baseService = {
                /**
                 * 用于文件预览 返回文件的本地地址
                 * @param obj
                 * @returns {*}
                 */
                getFilePath: function (obj) {
                    if (obj) {
                        //IE
                        if (window.navigator.userAgent.indexOf("MSIE 6.0") >= 1) {
                            return obj.value;
                        } else if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
                            obj.select();
                            obj.blur();
                            // IE下取得图片的本地路径
                            return document.selection.createRange().text;
                        }
                        //firefox
                        else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
                            if (obj.files) {
                                // Firefox下取得的是图片的数据
                                var value = "";
                                try {
                                    value = window.URL.createObjectURL(obj.files[0]);
                                } catch (e) {
                                    value = obj.files[0].getAsDataURL();
                                }
                                return value;
                            }
                        } else if (window.navigator.userAgent.indexOf("Chrome") >= 1) {
                            return window.URL.createObjectURL(obj.files[0]);

                        }
                        return obj.value;
                    }
                },
                /**
                 * http 上传文件
                 * @param url      后台链接
                 * @param file     文件对象
                 * @param callbackOfSuccess 成功回调
                 * @param callBackOfError   失败回调
                 */
                uploadUsingHttp: function (url, file, callbackOfSuccess, callBackOfError) {
                    var fd = new FormData();
                    fd.append('files', file);
                    $http({
                        method: 'POST',
                        url: url,
                        data: fd,
                        headers: {'Content-Type': undefined},
                        transformRequest: angular.identity
                    })
                        .success(function (response) {
                            callbackOfSuccess.call(null, response);
                        })
                        .error(function (err) {
                            callBackOfError.call(null, err);
                        });
                },
                /**
                 * Upload 上传文件
                 * @param url  后台链接
                 * @param file 文件对象
                 * @param resumable
                 * @param callbackOfSuccess 成功回调
                 * @param callBackOfError   失败回调
                 */
                uploadUsingUpload: function (url, file, resumable, callbackOfSuccess, callBackOfError) {
                    file.upload = Upload.upload({
                        url: url,
                        headers: {'Content-Type': 'multipart/form-data'},
                        data: {file: file}
                    });
                    file.upload.then(function (response) {
                        callbackOfSuccess.call(null, response);

                    }, function (response) {
                        callBackOfError.call(null, response);
                    }, function (evt) {
                        // Math.min is to fix IE which reports 200% sometimes
                        //file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
                },
                /**
                 * 根据id删除集合中的对象
                 * @param data
                 * @param id
                 * @returns {*}
                 */
                delObjInList: function (data, id) {
                    return data.filter(function (elt, index, arr) {
                        return elt._id != id;
                    });
                }
            };
            return baseService;
        }
    ])

    .service('authentication', ['$window', function ($window) {
        var saveToken = function (token) {
            $window.localStorage['read-token'] = token;
        };
        var getToken = function () {
            return $window.localStorage['read-token'];
        };
        return {
            saveToken: saveToken,
            getToken: getToken
        };
    }])
;
