const r = document.getElementById("rate_btn")
const d = document.getElementById("del_rate_btn")

function rate(){
    r.disabled = true; 
    d.disabled = false; 
}

function delete_Rate(){
    r.disabled = false; 
    d.disabled = true; 
}
