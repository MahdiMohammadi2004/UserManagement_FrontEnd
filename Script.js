const app = {
  //////////////////  بخش داشبورد

  dashboard: {
    init: function () {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        window.location.href = "login.html";
      }

      this.fetchUsers(token);
      this.searchUsers();
      this.deleteUser(token);
      this.redirectToCreateUserPage();
      this.redirectToEditUserPage();
    },

    fetchUsers: function (token) {
      $.ajax({
        url: "https://localhost:7286/api/GetAllUser",
        type: "GET",
        headers: { Authorization: "Bearer " + token },
        success: function (response) {
          const users = response.data;
          const tableBody = $("#userTableBody");
          tableBody.empty();
          users.forEach((user) => {
            let role = user.roleId === 1 ? "User" : "Admin";
            const row = `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.username}</td>
                  <td>${role}</td>
                  <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${user.id}">ویرایش</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">حذف</button>
                  </td>
                </tr>
              `;
            tableBody.append(row);
          });
        },
        error: function () {
          alert("خطا در بارگذاری اطلاعات کاربر");
        },
      });
    },

    searchUsers: function () {
      $("#searchInput").on("input", function () {
        const searchTerm = $(this).val().toLowerCase();
        $("#userTableBody tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(searchTerm) > -1);
        });
      });
    },

    deleteUser: function (token) {
      $("#userTableBody").on("click", ".delete-btn", function () {
        const userId = $(this).data("id");

        const isConfirmed = confirm(
          "آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟"
        );

        if (isConfirmed) {

          $.ajax({
            url: `https://localhost:7286/api/${userId}`,
            type: "DELETE",
            headers: { Authorization: "Bearer " + token },
            success: function () {
              app.dashboard.fetchUsers(token); // بارگذاری مجدد لیست کاربران
            },
            error: function () {
              alert("خطا در حذف کاربر");
            },
          });
        } else {
          console.log("عملیات حذف لغو شد");
        }
      });
    },

    redirectToCreateUserPage: function () {
      $("#createUserBtn").on("click", function () {
        window.location.href = "Register.html";
      });
    },

    redirectToEditUserPage: function () {
      $("#userTableBody").on("click", ".edit-btn", function () {
        const userId = $(this).data("id");
        window.location.href = `edit-user.html?id=${userId}`;
      });
    },
  },

  /////////////////////////  بخش ورود
  login: {
    init: function () {
      this.handleLogin();
    },

    handleLogin: function () {
      $("#loginForm").on("submit", function (event) {
        event.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
          url: "https://localhost:7286/api/Login",
          type: "POST",
          data: JSON.stringify({ username: username, password: password }),
          contentType: "application/json",
          success: function (response) {
            localStorage.setItem("jwtToken", response.token);
            window.location.href = "Dashbord.html";
          },
          error: function () {
            $("#errorMessage").removeClass("d-none");
          },
        });
      });
    },
  },

  /////////////////////  بخش ثبت نام

  register: {
    init: function () {
      this.handleRegister();
    },

    handleRegister: function () {
      $("#registerForm").on("submit", function (e) {
        e.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
          url: "https://localhost:7286/api/Register",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ username, password }),
          success: function () {
            alert("کاربر با موفقیت ثبت شد");
            window.location.href = "login.html";
          },
          error: function () {
            alert("این کاربر قبلا ثبت نام کرده است");
          },
        });
      });
    },
  },

  ///////////////////   بخش ویرایش کاربر
  editUser: {
    init: function () {
      const userId = new URLSearchParams(window.location.search).get("id");
      if (!userId) {
        alert("شناسه کاربر یافت نشد!");
        return;
      }

      this.fetchUserData(userId);
      this.handleEdit(userId);
    },

    fetchUserData: function (userId) {
      $.ajax({
        url: `https://localhost:7286/api/User/${userId}`,
        type: "GET",
        success: function (response) {
          const user = response.data;
          if (user) {
            $("#username").val(user.username);
            $("#password").val("");
          } else {
            alert("اطلاعات کاربر یافت نشد!");
          }
        },
        error: function () {
          alert("خطا در بارگذاری اطلاعات کاربر");
        },
      });
    },

    handleEdit: function (userId) {
      $("#editForm").on("submit", function (e) {
        e.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
          url: `https://localhost:7286/api/updateuser/${userId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify({ username, password }),
          success: function () {
            alert("اطلاعات کاربر با موفقیت ویرایش شد");
            window.location.href = "Dashbord.html";
          },
          error: function () {
            alert("خطا در ویرایش اطلاعات");
          },
        });
      });
    },
  },
};

/////////////////  اجرای ماژول‌های مختلف در هر صفحه

$(document).ready(function () {
  if (window.location.pathname.includes("Dashbord.html")) {
    app.dashboard.init();
  } else if (window.location.pathname.includes("login.html")) {
    app.login.init();
  } else if (window.location.pathname.includes("Register.html")) {
    app.register.init();
  } else if (window.location.pathname.includes("edit-user.html")) {
    app.editUser.init();
  }
});
