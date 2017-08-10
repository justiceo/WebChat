$('.chat[data-chat=person2]').addClass('active-chat');
$('.person[data-chat=person2]').addClass('active');

$('.left .person').mousedown(function () {
    if ($(this).hasClass('.active')) {
        return false;
    } else {
        var findChat = $(this).attr('data-chat');
        var personName = $(this).find('.name').text();
        $('.right .top .name').html(personName);
        $('.chat').removeClass('active-chat');
        $('.left .person').removeClass('active');
        $(this).addClass('active');
        $('.chat[data-chat = ' + findChat + ']').addClass('active-chat');
    }
});        