let movieBoard = document.querySelector("#movieBoard");
let apikey = "c76de0a735f9168bdd7f6bbb942cc1b9";
let nowBoard = document.querySelector("#nowBoard");
let upcomingBoard = document.querySelector("#upcomingBoard");
let suggestBoard = document.querySelector("#suggestBoard");

// 🔅영화 가져오기_섹션1_현재상영중
let page = 1;
let nowPage;
let nowCount = 0;

let returnLimit;

nowMovie = async (page = 1) => {
  let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}&language=ko-KR&page=${page}&region=KR`;

  let reponse = await fetch(url);
  let data = await reponse.json();
  console.log(data);
  console.log(data.page);

  let movieList = data.results;
  console.log(movieList);

  // let nowFirst = movieList.slice(0,5)

  nowPage = page;
  // currentCount=0;

  nowMore(movieList);
};

// 🔅화면에 보이기_섹션1_현재상영중
nowRender = (nowSecond) => {
  // nowBoard.innerHTML = "";

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
          <p class="releaseDate">개봉일│${movie.release_date}</p>
        </div>
      </div>
      <h3 title="${movie.title}">${movie.title}</h3>
      <p>★${rate.toFixed(1)}</p>
    </div>`;
    nowBoard.innerHTML += card;
    console.log(returnLimit);

    findDirector(movie.id).then((director) => {
      let card = nowBoard.querySelector(`.card[data-id="${movie.id}"]`);
      if (card) {
        let p = card.querySelector(".director");
        p.innerHTML = `감독│<br>${
          director.length > 1 ? director[0] + " ..." : director
        }`;
        p.title = `${director}`;
        console.log(director);
      }
    });
  });
};
// function textOver(overview, limit) {
//   return overview.length > limit
//     ? overview.slice(0, limit) +
//         `... <i class="fa-solid fa-magnifying-glass" onClick="modal('${overview}')"></i>`
//     : overview;
// }

//
//

// 🔅더보기 버튼_섹션1_현재상영중
let nowMoreBtn = document.querySelector("#con01 .more");
nowMoreBtn.addEventListener("click", function () {
  nowMovie(nowPage);
});

function nowMore(movieList) {
  let nowSecond = movieList.slice(nowCount, nowCount + 5);
  nowCount += 5;

  if (nowCount >= 20) {
    nowPage++;
    // nowMovie(nowPage);
    nowCount = 0;
  }

  console.log("page", nowPage);
  console.log("rotn", nowCount);
  nowRender(nowSecond);
}

// 🔅더보기 접기_섹션1_현재상영중
let back1 = document.querySelector("#con01 .back");

nowMovie();

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

  // setTimeout(() => {
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
  // }, 0);
});

//
//
//
//
//
// 🔅영화 가져오기_섹션2_상영예정

let upcomingPage = 1;
let upcomingList = []; // 아직 화면에 보여주지 않은 개봉예정 영화 리스트
let upcomingIndex = 0; // upcomingPool에서 어디까지 보여줬는지
let upcomingMaxPage = 5;
let today = new Date(); // 오늘날짜

async function upcomingMovie(need = 5) {
  while (upcomingList.length < need) {
    while (upcomingPage <= upcomingMaxPage) {
      let url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}&language=ko-KR&page=${upcomingPage}&region=KR&sort_by=primary_release_date.asc`;
      let response = await fetch(url);
      let data = await response.json();

      let movieList = data.results;

      // 더 이상 페이지가 없다면 반복 종료
      if (!movieList || movieList.length === 0) break;

      // pool에 누적 저장
      upcomingList.push(...movieList); // ...이 누적이라는 뜻일까?

      upcomingPage++;
    }

    // ✅ 누적된 전체 리스트를 개봉일 기준 오름차순 정렬 (개봉 임박 순)
    upcomingList.sort(
      (a, b) => new Date(a.release_date) - new Date(b.release_date)
    );

    console.log(upcomingList);
    // upcomingMore(upcomingList)
  }
}

// 🔅화면에 보이기_섹션2_상영예정
function upcomingRender(slice) {
  // upcomingBoard.innerHTML = "";

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
          <p class="releaseDate">개봉예정일│${movie.release_date}</p>
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
          p.textContent = `재개봉일│${RereleaseDate}`;
        }
      });
    }
  });
}

//           <p class="releaseDate">개봉예정일│${movie.release_date}</p>

upcomingMore();
console.log("뭐야>", upcomingList);

// ✔ 최초 실행: 5개 확보만 하고, 렌더링은 하지 않음
// upcomingMovie(5).then(() => {
//   upcomingMore(); // 첫 5개 출력
// });

// 🔅더보기 버튼_섹션2_상영예정
let upcomingMoreBtn = document.querySelector("#con02 .more");

upcomingMoreBtn.addEventListener("click", function () {
  upcomingMore();
});

async function upcomingMore() {
  // let nowSecond = upcomingList.slice(upcomingIndex, upcomingIndex + 5);

  // 필요 개수(현재 인덱스보다 5개 더 필요)
  let needCount = upcomingIndex + 5;

  // 리스트에 부족하면 추가 fetch
  // upcomingMovie(needCount).then(()=>{
  //   let slice = upcomingList.slice(upcomingIndex, upcomingIndex + 5);
  // })]

  // 부족하면 데이터를 추가로 fetch
  if (upcomingList.length < needCount) {
    await upcomingMovie(needCount);
  }

  let slice = upcomingList.slice(upcomingIndex, upcomingIndex + 5);

  // ✔ 다음 more 때는 이어서 출력해야 하므로 인덱스 증가
  // upcomingIndex += 5;
  upcomingIndex += slice.length;

  // upcomingRender(nowSecond)
  upcomingRender(slice);
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// 🔅영화 가져오기_섹션3_추천영화

let suggestPage = 1;
let suggestCount = 0;
let suggestPool = []; // 전체 영화 저장

suggestMovie = async (page = 1) => {
  let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&language=ko-KR&page=${page}`;

  /*
  currentPage = page;
  let currentList = lists
  */

  let reponse = await fetch(url);
  let data = await reponse.json();
  console.log(data);
  console.log(data.page);

  let movieList = data.results;
  console.log(movieList);

  suggestPool.push(...movieList); // ??

  suggestPage = page;

  suggestMore(movieList); // 함수 호출할 때도 page 넣어서 render에서 몇페이지인지 보이게 해야할 것 같은데 지금은 일단 냅둠
};

// 🔅더보기 버튼_섹션3_추천영화
let suggestMoreBtn = document.querySelector("#con03 .more");
// suggestMoreBtn.addEventListener("click", function () {
//   suggestMovie(suggestPage);
// });

function suggestMore(movieList) {
  let suggestSecond = movieList.slice(suggestCount, suggestCount + 5);

  suggestCount += 5;

  // 더 이상 없으면 종료
  // if (slice.length === 0) return;

  if (suggestCount >= 20) {
    suggestPage++;
    // suggestMovie(suggestPage);
    suggestCount = 0;
  }

  console.log("page", suggestPage);
  console.log("rotn", suggestCount);
  // nowRender(slice, true); // append 모드
  suggestRender(suggestSecond);
}

// 🔅화면에 보이기_섹션3_추천영화
suggestRender = (suggestSecond) => {
  // suggestBoard.innerHTML = "";

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
          <p class="releaseDate">개봉일│${movie.release_date}</p>
        </div>
      </div>
      <h3 title="${movie.title}">${movie.title}</h3>
      <p>★${rate.toFixed(1)}</p>
    </div>`;
    suggestBoard.innerHTML += card;

    findDirector(movie.id).then((director) => {
      let card = suggestBoard.querySelector(`.card[data-id="${movie.id}"]`);
      // console.log("되니", card);
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

//
//
//
//
//
//  장르 실험용
//
//
//
//
//

let filterPage = 1;
let filterList = []; // 아직 화면에 보여주지 않은 개봉예정 영화 리스트
let filterIndex = 0; // upcomingPool에서 어디까지 보여줬는지

// 정보 가져와서 필터링, 저장
async function suggestFilter(genreId) {
  currentGenre = genreId; // 여기에 추가

  // need = 5;
  console.log(filterPage);

  while (filterList.length - filterIndex < 5) {
    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&language=ko-KR&page=${filterPage}`;
    let response = await fetch(url);
    let data = await response.json();

    // 더 이상 페이지가 없다면 반복 종료
    if (!data.results || data.results.length === 0) break;
    // if (filterPage > 500) break;

    // 개봉예정 필터
    let suggestFiltering = data.results.filter((movie) => {
      return (
        Array.isArray(movie.genre_ids) && movie.genre_ids.includes(genreId)
      );
    });

    // pool에 누적 저장
    filterList.push(...suggestFiltering); // ...이 누적이라는 뜻일까?

    filterPage++;

    console.log(filterList);
  }
}

async function filterRender() {
  console.log("되ㅣ나3");

  // 1) 모드 전환
  currentMode = "filter";
  // currentGenre = genreId;

  // 3) 리스트 초기화
  // filterPage = 1; //??
  // filterList = [];
  // filterIndex = 0; //??

  // 5개 이상 없으면 채워 넣기
  // if (filterList.length - filterIndex < 5) {
  //   await suggestFilter(filterIndex + 5);
  // }

  // 필요 개수 계산 (보여줄 5개 중 현재 남아있는 개수)
  let remain = filterList.length - filterIndex;

  if (remain < 5) {
    // 부족한 만큼 더 채우기
    await suggestFilter(currentGenre);
  }

  // 그래도 5개 미만이면(마지막)
  const slice = filterList.slice(filterIndex, filterIndex + 5);

  // suggestRender(slice, true);

  filterIndex += slice.length;

  // const slice = filterList.slice(0, 5);
  // suggestBoard.innerHTML = ""; // 화면 초기화
  suggestRender(slice);

  // filterIndex = 5;

  // 로딩 끝. slice.length가 5보다 작으면 더 불러올게 없음.
}
let currentMode = "normal"; // "normal" | "filter"
let currentGenre = null; // 선택된 장르 ID

//
//
//
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

    // filterList, filterIndex 초기화
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

//
//
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

//
//
//
//
//
//
//
//
//
//
//
// 🔅메뉴 버튼 누르면 스크롤 움직임
let btn1 = document.querySelector(".btn1");
let btn2 = document.querySelector(".btn2");
let btn3 = document.querySelector(".btn3");
let headerHeight = document.querySelector("header").offsetHeight;

function movingScroll(SecHeight) {
  window.scrollTo({
    top: SecHeight,
    behavior: "smooth",
  });
}

btn1.addEventListener("click", function () {
  let nowHeight = document.querySelector("#con01").offsetTop - headerHeight;
  movingScroll(nowHeight);
});
btn2.addEventListener("click", function () {
  let upcomingHeight =
    document.querySelector("#con02").offsetTop - headerHeight;
  movingScroll(upcomingHeight);
});
btn3.addEventListener("click", function () {
  let suggestHeight = document.querySelector("#con03").offsetTop - headerHeight;
  movingScroll(suggestHeight);
});

//
//
//

//
//
//
// 🔅재개봉 날짜 찾기
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
  console.log(RereleaseDate);
  return RereleaseDate;
}

// 🔅감독 이름 가져오기
async function findDirector(movie_id) {
  let url = `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${apikey}&language=ko-KR`;

  let reponse = await fetch(url);
  let data = await reponse.json();
  // console.log(data);

  let movieList = data.crew;
  // console.log(movieList);

  let step1 = movieList.filter((movie) => {
    return movie.job == "Director";
  });

  let director = step1.map((movie) => {
    return movie.name;
  });
  return director;
}

// 🔅클릭시 영화 검색창
function searchMovie(movieTitle) {
  let url = `https://search.naver.com/search.naver?query=영화 ${movieTitle}`;
  window.open(url, "_blank");
}
