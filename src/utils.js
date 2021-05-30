export const params =  new URLSearchParams(window.location.search);
export  const getParams =  function (name) {
    return '' + params.get(name);
};
export const getGameSessionId = function () {
    return getParams('roomId') + getParams('sessionId');
}

