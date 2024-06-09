// Profil Yükleme ve Çıkış Yap Fonksiyonları
document.getElementById("showProfile")?.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "profile.html";
});

document.getElementById("logout")?.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

function loadProfile() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
        document.getElementById("profileInfo").innerHTML = `
            <p>Kullanıcı Adı: ${user.username}</p>
            <h3>Biletler</h3>
            <ul>${user.bookings.map((booking, index) =>
                `<li>
                    Film: ${booking.movieTitle}, Seans: ${booking.session}, Koltuk: ${booking.seat + 1}
                    <button onclick="cancelBooking(${index})">İptal Et</button>
                </li>`
            ).join("")}</ul>
        `;
    }
}

function cancelBooking(index) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
        user.bookings.splice(index, 1);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        loadProfile();
    }
}

// Kayıt Ol Fonksiyonu
document.getElementById("registerForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find((user) => user.username === username)) {
        alert("Bu kullanıcı zaten kayıtlıdır. Lütfen farklı bir kullanıcı adı giriniz.");
        return;
    }

    users.push({ username, password, bookings: [] });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Kayıt başarılı. Lütfen giriş yapınız.");
    window.location.href = "login.html";
});

// Giriş Yap Fonksiyonu
document.getElementById("loginForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find((user) => user.username === username && user.password === password);
    if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        alert("Giriş başarılı. Yönlendiriliyorsunuz...");
        window.location.href = "index.html";
    } else {
        alert("Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyiniz.");
    }
});

// Bilet Satış ve Seçim Fonksiyonları
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('profile.html')) {
        loadProfile();
    }

    if (window.location.pathname.endsWith('confirm.html')) {
        loadConfirmation();
    }

    const seatsContainer = document.querySelector('.seats');
    const buyTicketButton = document.getElementById('buy-ticket');
    const showtimeButtons = document.querySelectorAll('.showtime');
    const totalSeats = 50;
    const seatPrice = 150;

    let selectedSeats = [];
    let selectedFilm = "";
    let selectedShowtime = "";

    function createSeats() {
        if (!seatsContainer) return;
        seatsContainer.innerHTML = ''; // Eski koltukları temizle
        for (let i = 0; i < totalSeats; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            seat.textContent = i + 1;
            seat.addEventListener('click', function() {
                if (selectedSeats.includes(seat)) {
                    selectedSeats = selectedSeats.filter(s => s !== seat);
                    seat.classList.remove('selected');
                } else {
                    selectedSeats.push(seat);
                    seat.classList.add('selected');
                }
                if (selectedSeats.length > 0) {
                    buyTicketButton.style.display = 'block';
                } else {
                    buyTicketButton.style.display = 'none';
                }
            });
            seatsContainer.appendChild(seat);
        }
    }

    function clearSelection() {
        selectedSeats.forEach(seat => {
            seat.classList.remove('selected');
        });
        selectedSeats = [];
        buyTicketButton.style.display = 'none';
    }

    function displayConfirmation() {
        const selectedSeatsInfo = selectedSeats.map(seat => seat.textContent).join(', ');
        const totalPrice = selectedSeats.length * seatPrice;
        const confirmationMessage = `
            <div class="confirmation-container">
                <h2>Bilet Onayı</h2>
                <p>${selectedFilm} filmi için ${selectedShowtime} seansına ${selectedSeats.length} adet bilet seçilmiştir.</p>
                <p>Seçilen Koltuklar: ${selectedSeatsInfo}</p>
                <p>Toplam ücret: ${totalPrice} TL</p>
                <button id="confirm-purchase">Evet, Satın Al</button>
                <button id="cancel-purchase">Hayır, İptal Et</button>
            </div>
        `;
        localStorage.setItem("confirmationDetails", JSON.stringify({
            selectedFilm,
            selectedShowtime,
            selectedSeats: selectedSeats.map(seat => seat.textContent),
            totalPrice
        }));
        window.location.href = "confirm.html";
    }

    function loadConfirmation() {
        const confirmationDetails = JSON.parse(localStorage.getItem("confirmationDetails"));
        if (confirmationDetails) {
            document.getElementById("confirmationInfo").innerHTML = `
                <p>${confirmationDetails.selectedFilm} filmi için ${confirmationDetails.selectedShowtime} seansına ${confirmationDetails.selectedSeats.length} adet bilet seçilmiştir.</p>
                <p>Seçilen Koltuklar: ${confirmationDetails.selectedSeats.join(', ')}</p>
                <p>Toplam ücret: ${confirmationDetails.totalPrice} TL</p>
            `;
            document.getElementById("confirmPurchase").addEventListener("click", function() {
                finalizePurchase(confirmationDetails);
            });
            document.getElementById("cancelPurchase").addEventListener("click", function() {
                localStorage.removeItem("confirmationDetails");
                window.location.href = "index.html";
            });
        }
    }

    function finalizePurchase(details) {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user) {
            details.selectedSeats.forEach(seat => {
                user.bookings.push({
                    movieTitle: details.selectedFilm,
                    session: details.selectedShowtime,
                    seat: parseInt(seat) - 1
                });
            });
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            localStorage.removeItem("confirmationDetails");
            alert("Biletler başarıyla satın alındı.");
            window.location.href = "profile.html";
        } else {
            alert("Lütfen önce giriş yapınız.");
        }
    }

    showtimeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parent = button.parentElement;
            if (parent && parent.querySelector('h2')) {
                selectedFilm = parent.querySelector('h2').textContent;
                selectedShowtime = button.textContent;
                showSeatSelection();
                createSeats(); // Koltuk seçimlerini yeniden oluştur
            }
        });
    });

    buyTicketButton.addEventListener('click', function() {
        displayConfirmation();
    });

    function showSeatSelection() {
        const seatSelection = document.getElementById('seat-selection');
        seatSelection.classList.remove("hidden");
        window.scrollTo(0, document.body.scrollHeight);
    }

    createSeats();
});
