let movieBoard = document.querySelector("#movieBoard");
let apikey = "c76de0a735f9168bdd7f6bbb942cc1b9";
let nowBoard = document.querySelector("#nowBoard");
let upcomingBoard = document.querySelector("#upcomingBoard");
let suggestBoard = document.querySelector("#suggestBoard");

// 슬라이드
let slide = document.querySelector("#slide .slideImg");
let kobisApi = "3ba6cbbeb2980ab0e7feea1ed9882843";

let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
let yesterdayDt = yesterday.toISOString().slice(0, 10).replaceAll("-", "");

slideMovie = async () => {
  // kobis api 가져오기
  let url = `https://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${kobisApi}&targetDt=${yesterdayDt}`;

  let reponse = await fetch(url);
  let data = await reponse.json();

  let topMovies = data.boxOfficeResult.dailyBoxOfficeList;
  let topMoviesList = topMovies.slice(0, 5);

  console.log(topMoviesList);

  // TMDB에서 검색 & 이미지 가져오기
  let topMoviesImages = await Promise.all(
    topMoviesList.map(async (movie) => {
      try {
        let tmdb = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${encodeURIComponent(
            movie.movieNm,
          )}&language=ko-KR`,
        );
        let tmdbData = await tmdb.json();
        let tmdbMovie = tmdbData.results?.[0];

        return {
          title: tmdbMovie?.title || movie.movieNm,
          image: tmdbMovie?.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}`
            : tmdbMovie?.poster_path
              ? `https://image.tmdb.org/t/p/w780${tmdbMovie.poster_path}`
              : "https://picsum.photos/1280/720",
        };
      } catch (e) {
        return {
          title: movie.movieNm,
          image: "https://picsum.photos/1280/720",
        };
      }
    }),
  );

  slide.innerHTML = topMoviesImages
    .map((movie, index) => {
      if (movie.image) {
        return `
        <li>
          <img src="${movie.image}"
               alt="${movie.title}" onClick="searchMovie('${encodeURIComponent(
                 movie.title,
               )}')">
          <span class="rank">${index + 1}</span>
          <h4>${movie.title}</h4>
        </li>
      `;
      }
    })
    .join("");
};
slideMovie();

// 슬라이드 움직이기
setInterval(function () {
  $("#slide .slideImg").animate({ "margin-left": "-100%" }, function () {
    $("#slide li:first-child").appendTo("#slide .slideImg");
    $("#slide .slideImg").css({ "margin-left": "0%" });
  });
}, 3000);

// 영화 가져오기_섹션1_현재상영중
let page = 1;
let nowPage;
let nowCount = 0;

let returnLimit;

nowMovie = async (page = 1) => {
  let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}&language=ko-KR&page=${page}&region=KR`;

  let reponse = await fetch(url);
  let data = await reponse.json();

  let movieList = data.results;
  console.log(movieList);
  nowPage = page;

  nowMore(movieList);
};

// 화면에 보이기_섹션1_현재상영중
nowRender = (nowSecond) => {
  nowSecond.forEach((movie) => {
    let rate = movie.vote_average;

    let card = `
    <div class="card" data-id="${
      movie.id
    }"  onClick="searchMovie('${encodeURIComponent(movie.title)}')">
      <div>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"></img>
        <div class="info">
          <p class="plot">${
            movie.overview ? movie.overview : "상세설명이 없습니다."
          }
          </p>
          <p class="director"></p>
          <p class="releaseDate">개봉일│</br>${movie.release_date}</p>
        </div>
      </div>
      <h3 title="${movie.title}">${movie.title}</h3>
      <p>★${rate.toFixed(1)}</p>
    </div>`;
    nowBoard.innerHTML += card;

    findDirector(movie.id).then((director) => {
      let card = nowBoard.querySelector(`.card[data-id="${movie.id}"]`);
      if (card) {
        let p = card.querySelector(".director");
        p.innerHTML = `감독│<br>${
          director.length > 1 ? director[0] + " ..." : director
        }`;
        p.title = `${director}`;
      }
    });
  });
};

// 더보기 버튼_섹션1_현재상영중
let nowMoreBtn = document.querySelector("#con01 .more");
nowMoreBtn.addEventListener("click", function () {
  nowMovie(nowPage);
});

function nowMore(movieList) {
  let nowSecond = movieList.slice(nowCount, nowCount + 5);
  nowCount += 5;

  if (nowCount >= 20) {
    nowPage++;
    nowCount = 0;
  }

  nowRender(nowSecond);
}

nowMovie();

// 영화 가져오기_섹션2_상영예정
let upcomingPage = 1;
let upcomingList = [];
let upcomingIndex = 0;
let upcomingMaxPage = 5;
let today = new Date(); // 오늘날짜

async function upcomingMovie(need = 5) {
  while (upcomingList.length < need) {
    while (upcomingPage <= upcomingMaxPage) {
      let url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}&language=ko-KR&page=${upcomingPage}&region=KR&sort_by=primary_release_date.asc`;
      let response = await fetch(url);
      let data = await response.json();

      let movieList = data.results;

      if (!movieList || movieList.length === 0) break;

      // pool에 누적 저장
      upcomingList.push(...movieList);

      upcomingPage++;
    }

    // 누적된 전체 리스트를 개봉일 기준 오름차순 정렬
    upcomingList.sort(
      (a, b) => new Date(a.release_date) - new Date(b.release_date),
    );

    console.log(upcomingList);
  }
}

// 화면에 보이기_섹션2_상영예정
function upcomingRender(slice) {
  slice.forEach((movie) => {
    let rate = movie.vote_average;

    let card = `
    <div class="card" data-id="${
      movie.id
    }" onClick="searchMovie('${encodeURIComponent(movie.title)}')">
      <div>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"></img>
        <div class="info">
          <p class="plot">${
            movie.overview ? movie.overview : "상세설명이 없습니다."
          }
          </p>
          <p class="director"></p>
          <p class="releaseDate">개봉예정일│</br>${movie.release_date}</p>
        </div>
      </div>
      <h3 title="${movie.title}">${movie.title}</h3>
      <p>★${rate.toFixed(1)}</p>
    </div>`;
    upcomingBoard.innerHTML += card;

    findDirector(movie.id).then((director) => {
      let card = upcomingBoard.querySelector(`.card[data-id="${movie.id}"]`);
      if (card) {
        let p = card.querySelector(".director");
        p.innerHTML = `감독│<br>${
          director.length > 1 ? director[0] + " ..." : director
        }`;
        p.title = `${director}`;
      }
    });

    if (new Date(movie.release_date) < today) {
      Rerelease(movie.id).then((RereleaseDate) => {
        let card = upcomingBoard.querySelector(`.card[data-id="${movie.id}"]`);
        if (card) {
          let p = card.querySelector(".releaseDate");
          p.innerHTML = `재개봉일│<br>${RereleaseDate}`;
        }
      });
    }
  });
}

upcomingMore();

// 더보기 버튼_섹션2_상영예정
let upcomingMoreBtn = document.querySelector("#con02 .more");

upcomingMoreBtn.addEventListener("click", function () {
  upcomingMore();
});

async function upcomingMore() {
  let needCount = upcomingIndex + 5;

  // 부족하면 데이터를 추가로 fetch
  if (upcomingList.length < needCount) {
    await upcomingMovie(needCount);
  }

  let slice = upcomingList.slice(upcomingIndex, upcomingIndex + 5);
  upcomingIndex += slice.length;

  upcomingRender(slice);
}

// 영화 가져오기_섹션3_추천영화
let suggestPage = 1;
let suggestCount = 0;
let suggestPool = [];

suggestMovie = async (page = 1) => {
  let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&language=ko-KR&page=${page}`;

  let reponse = await fetch(url);
  let data = await reponse.json();

  let movieList = data.results;
  console.log(movieList);

  suggestPool.push(...movieList); // ??

  suggestPage = page;

  suggestMore(movieList);
};

// 더보기 버튼_섹션3_추천영화
let suggestMoreBtn = document.querySelector("#con03 .more");

function suggestMore(movieList) {
  let suggestSecond = movieList.slice(suggestCount, suggestCount + 5);

  suggestCount += 5;

  if (suggestCount >= 20) {
    suggestPage++;
    suggestCount = 0;
  }

  suggestRender(suggestSecond);
}

// 화면에 보이기_섹션3_추천영화
suggestRender = (suggestSecond) => {
  suggestSecond.forEach((movie) => {
    let rate = movie.vote_average;

    let card = `
    <div class="card" data-id="${
      movie.id
    }" onClick="searchMovie('${encodeURIComponent(movie.title)}')">
      <div>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"></img>
        <div class="info">
          <p class="plot">${
            movie.overview ? movie.overview : "상세설명이 없습니다."
          }
          </p>
          <p class="director"></p>
          <p class="releaseDate">개봉일│</br>${movie.release_date}</p>
        </div>
      </div>
      <h3 title="${movie.title}">${movie.title}</h3>
      <p>★${rate.toFixed(1)}</p>
    </div>`;
    suggestBoard.innerHTML += card;

    findDirector(movie.id).then((director) => {
      let card = suggestBoard.querySelector(`.card[data-id="${movie.id}"]`);
      if (card) {
        let p = card.querySelector(".director");
        p.innerHTML = `감독│<br>${
          director.length > 1 ? director[0] + " ..." : director
        }`;
        p.title = `${director}`;
      }
    });
  });
};
suggestMovie();

// 장르별 필터링 하기
let filterPage = 1;
let filterList = [];
let filterIndex = 0;

// 정보 가져와서 필터링, 저장
async function suggestFilter(genreId) {
  currentGenre = genreId;
  console.log(filterPage);

  while (filterList.length - filterIndex < 5) {
    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&language=ko-KR&page=${filterPage}`;
    let response = await fetch(url);
    let data = await response.json();

    // 더 이상 페이지가 없다면 반복 종료
    if (!data.results || data.results.length === 0) break;

    // 개봉예정 필터
    let suggestFiltering = data.results.filter((movie) => {
      return (
        Array.isArray(movie.genre_ids) && movie.genre_ids.includes(genreId)
      );
    });

    filterList.push(...suggestFiltering);
    filterPage++;

    console.log(filterList);
  }
}

async function filterRender() {
  currentMode = "filter";

  // 필요 개수 계산
  let remain = filterList.length - filterIndex;

  if (remain < 5) {
    await suggestFilter(currentGenre);
  }

  let slice = filterList.slice(filterIndex, filterIndex + 5);
  filterIndex += slice.length;

  suggestRender(slice);
}
let currentMode = "normal";
let currentGenre = null;

// 버튼 누르면 필터링 되게
let genreBtn = document.querySelectorAll("#con03 .genre .genreBtn");
let allBtn = document.querySelector("#con03 .genre .allBtn");

$("#con03 .genre button").on("click", function () {
  $("#con03 .genre button").removeClass("active");
  $(this).addClass("active");
});

genreBtn.forEach((btn) => {
  btn.addEventListener("click", async () => {
    let genreId = Number(btn.dataset.genre);

    filterList = [];
    filterIndex = 0;
    filterPage = 1;

    currentMode = "filter";
    currentGenre = genreId;

    suggestBoard.innerHTML = "";

    await suggestFilter(genreId);

    filterRender();
  });
});

allBtn.addEventListener("click", function () {
  currentMode = "normal";
  currentGenre = null;
  suggestPage = 1;
  suggestCount = 0;
  suggestPool = [];
  suggestBoard.innerHTML = "";
  suggestMovie();
});

// 필터링 할때 더보기 누르기
suggestMoreBtn.addEventListener("click", async function () {
  if (currentMode == "filter") {
    if (filterList.length - filterIndex < 5) {
      await suggestFilter(currentGenre);
    }
    filterRender();
    return;
  }
  suggestMovie(suggestPage);
});

// 더보기 접기 버튼
let nowBack = document.querySelector("#con01 .back");
nowBack.addEventListener("click", function () {
  let nowHeight = document.querySelector("#con01").offsetTop - headerHeight;
  movingScroll(nowHeight);

  nowCount = 0;
  nowPage = 1;
  nowBoard.innerHTML = "";
  nowMovie();
});

let upcomingBack = document.querySelector("#con02 .back");
upcomingBack.addEventListener("click", function () {
  let upcomingHeight =
    document.querySelector("#con02").offsetTop - headerHeight;
  movingScroll(upcomingHeight);

  upcomingBoard.innerHTML = "";
  upcomingPage = 1;
  upcomingList = [];
  upcomingIndex = 0;
  upcomingMore();
});

let suggestBack = document.querySelector("#con03 .back");
suggestBack.addEventListener("click", function () {
  let suggestHeight = document.querySelector("#con03").offsetTop - headerHeight;
  movingScroll(suggestHeight);

  if (currentMode == "filter") {
    filterPage = 1;
    filterList = [];
    filterIndex = 0;
    suggestBoard.innerHTML = "";
    filterRender();
  } else {
    suggestPage = 1;
    suggestCount = 0;
    suggestPool = [];
    suggestBoard.innerHTML = "";
    suggestMovie();
  }
});

// 상단 헤더 버튼 누르면 스크롤 움직임
let btn1 = document.querySelector(".btn1");
let btn2 = document.querySelector(".btn2");
let btn3 = document.querySelector(".btn3");
let btn4 = document.querySelector(".btn4");
let headerHeight = document.querySelector("header").offsetHeight;

function movingScroll(SecHeight) {
  window.scrollTo({
    top: SecHeight,
    behavior: "smooth",
  });
}

btn1.addEventListener("click", function () {
  let nowHeight = document.querySelector("#slide").offsetTop - headerHeight;
  movingScroll(nowHeight);
});
btn2.addEventListener("click", function () {
  let nowHeight = document.querySelector("#con01").offsetTop - headerHeight;
  movingScroll(nowHeight);
});
btn3.addEventListener("click", function () {
  let upcomingHeight =
    document.querySelector("#con02").offsetTop - headerHeight;
  movingScroll(upcomingHeight);
});
btn4.addEventListener("click", function () {
  let suggestHeight = document.querySelector("#con03").offsetTop - headerHeight;
  movingScroll(suggestHeight);
});

// 재개봉 날짜 찾기
let RereleaseDate;
async function Rerelease(movie_id) {
  let url = `https://api.themoviedb.org/3/movie/${movie_id}/release_dates?api_key=${apikey}&language=ko-KR`;

  let reponse = await fetch(url);
  let data = await reponse.json();

  let movieList = data.results;

  let step1 = movieList.filter((movie) => {
    return movie.iso_3166_1 == "KR";
  });

  let step2 = step1[0].release_dates;
  let step3 = step2.filter((movie) => {
    return movie.type == 2 || movie.type == 3;
  });
  step3.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

  let step4 = step3[0].release_date;

  let RereleaseDate = step4.slice(0, 10);
  return RereleaseDate;
}

// 감독 이름 가져오기
async function findDirector(movie_id) {
  let url = `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${apikey}&language=ko-KR`;

  let reponse = await fetch(url);
  let data = await reponse.json();

  let movieList = data.crew;

  let step1 = movieList.filter((movie) => {
    return movie.job == "Director";
  });

  let director = step1.map((movie) => {
    return movie.name;
  });
  return director;
}

// 영화 클릭시 네이버에 영화 검색
function searchMovie(movieTitle) {
  let url = `https://search.naver.com/search.naver?query=영화 ${movieTitle}`;
  window.open(url, "_blank");
}
