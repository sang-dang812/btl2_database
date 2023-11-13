
function getAllPhim() {
  // Sử dụng Fetch API hoặc XMLHttpRequest để gửi yêu cầu GET đến /phim
  fetch('/phim')
    .then(response => response.json())
    .then(data => {
      // Xử lý dữ liệu và hiển thị trên trang HTML
      const movieListElement = document.getElementById('movieList');
      movieListElement.innerHTML='';
      data.result.forEach(movie => {
        const listItem = document.createElement('li');
        const itemBtn = document.createElement('button');
        const deleteBtn = document.createElement('button');

        deleteBtn.dataset.id = `${movie.Maphim}`;
        deleteBtn.classList.add('deleteButton');
        deleteBtn.textContent = "Delete";
        itemBtn.textContent = "View";
        listItem.textContent = movie.Tenphim;

        deleteBtn.addEventListener('click', (e) => {
          var id = e.target.dataset.id;
          deleteMovie(id);
        })
        itemBtn.addEventListener('click', () => {
          alert(`Detail:
          Ten phim: ${movie.Tenphim}
          The loai: ${movie.Theloai}
          Ngon ngu trong phim: ${movie.Ngonngutrongphim}
          Quoc gia: ${movie.Quocgia}
          Gioi han do tuoi: ${movie.Gioihantuoi}+
          Thoi luong phim: ${movie.Thoiluongphim}
          Ngay chieu: ${movie.Ngaycongchieu}
          Tom tat noi dung chinh: ${movie.Tomtatnoidung}
          Dao dien: ${movie.Daodien}
          Trang thai: ${movie.Trangthai}`)
        });
        movieListElement.appendChild(listItem);
        movieListElement.appendChild(itemBtn);
        movieListElement.appendChild(deleteBtn);
      });
    })
    
    
    .catch(error => console.error('Lỗi khi lấy danh sách phim:', error));
}

//load
document.addEventListener('DOMContentLoaded', () => {
  getAllPhim();
});


var Maphim = document.getElementById('newMovieId');
var Tenphim = document.getElementById('newMovieTitle');
var submitButton = document.getElementById('submitButton');

submitButton.addEventListener('click',addMovieToList);
async function addMovieToList(e) {
  e.preventDefault();
  const res = await fetch('/phim/post', {
    method:'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({
      Maphim: Maphim.value,
      Tenphim: Tenphim.value
    })
  })
  getAllPhim();
}




async function deleteMovie(id) {
  const res = await fetch(`/phim/delete/${id}`,{
    method: 'DELETE',
    headers: {
      'Content-Type' : 'application/json'
    }
  })
  getAllPhim();
}


  
