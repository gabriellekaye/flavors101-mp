window.onload = function () {
    const form = document.getElementById('password-form')
    const oldPassHelp = document.getElementById('old-pass-error')
    const newPassHelp = document.getElementById('new-pass-error')
    const confirmPassHelp = document.getElementById('confirm-pass-error')
    const passfeedback = document.getElementById('password-feedback')

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(e.target))
        const { data } = await axios.post('/update-password', values)

        if (data.oldPassErr) {
            oldPassHelp.innerText = data.oldPassErr
        } else if (data.newPassErr) {
            newPassHelp.innerText = data.newPassErr
        } else if (data.confirmPassErr) {
            confirmPassHelp.innerText = data.confirmPassErr
        } else {
            passfeedback.innerText = "Password changed!"
        }
    })
}