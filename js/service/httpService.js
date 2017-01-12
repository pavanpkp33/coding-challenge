/**
 * Created by Pavan on 1/9/2017.
 */


//Generic REST API method
angular.module('codingChallenge').factory('httpService', function($http, $q){

    return {

        callRestApi : function(payLoad, url, method){

            var dfd = $q.defer();
            $.ajax({
                url: url,
                method: method,
                data: payLoad,
                contentType: "application/json"
            }).done(function(response) {
                dfd.resolve(response);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                dfd.reject(textStatus);
            })

            return dfd.promise;
        }

    }


})