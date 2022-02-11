
$("#delete").click( function () {
    const id = $("#cmt-id").val();

    $.post('/delete-comment', {id: id}, (isSuccess) => {
        if (isSuccess) {
            $("#cmt-id").remove();
        }
    });
});