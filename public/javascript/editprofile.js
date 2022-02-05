$(document).ready(function () {

    //Edit Profile
    $('#submit-edit').click(function () {
        let username = $('#username-input');
        let description = $('#description-input');
        let avatar = $('#avatar-input');

        $.get('/update-profile', {username: username.val(), description = description.val(), avatar: avatar.val()}, function(data, status){});
        window.location= '/profile';
    });

    $('#small_link').click(function () {
        window.location = '/edit-profile';
    });

    $('#delete-acct').click(function (){
        window.location = '/';
    })

    
})