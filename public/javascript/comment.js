$(document).ready(function () {

    $("#delete").click( function () {
        const id = $("#cmt-id").val();
    
        $.post('/:id/delete-comment', {id: id}, (isSuccess) => {
            if (isSuccess) {
                $("#cmt-id").remove();
            }
        });
    });

    $("#edit").click( function () {
        const id = $("#cmt-id").val();
        const text = $("#my_new_cmt").val();
        
        
        $.get('/:id/edit', {id: id}, (isSuccess) => {
           if (isSuccess) {
            window.location('/:id/edit');
           }
        });
    });

    $("#like").click( function () {
        const id = $("#cmt-id").val();
    
        $.post('/:id/like-comment', {id: id}, (isSuccess) => {
            if (isSuccess) {
                console.log("Liked Comment!");
            }
        });
    });
})
