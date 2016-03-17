"use strict";

function ErrorCreator($modal) {
    return {
        create: function(errorMessage) {
            var errorModal = $modal.open({
                animation: true,
                backdrop: "static",
                template: require("./error_popup.html"),
                controller: "ErrorPopupController",
                size: "sm",
                resolve: {
                    message: function() {
                        return errorMessage;
                    }
                }
            });
        }
    }
}

module.exports = ErrorCreator;