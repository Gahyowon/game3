javascript


let currentScene = "scene1";

async function loadStory() {
  // GitHub Pages에 올릴 때 파일 경로를 다시 한번 확인해 주세요.
  // index.html 파일과 같은 폴더에 story.json이 있다면 "story.json"
  // story.json이 다른 폴더(예: data 폴더) 안에 있다면 "data/story.json"
  const res = await fetch("story.json");
  if (!res.ok) {
    // 파일을 불러오지 못했을 때 오류 메시지를 콘솔에 출력
    console.error("Failed to load story.json:", res.status, res.statusText);
    document.getElementById("scene").innerText = "스토리 파일을 불러오는데 실패했습니다.";
    return null; // 스토리 로딩 실패 시 null 반환
  }
  return await res.json();
}

function renderScene(story, chapter, sceneId) {
  const scene = story[chapter][sceneId];
  if (!scene) {
    console.error("Scene not found:", chapter, sceneId);
    document.getElementById("scene").innerText = "장면 정보를 찾을 수 없습니다.";
    return; // 장면 정보가 없으면 함수 종료
  }

  document.getElementById("scene").innerText = scene.text;
  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  if (scene.ending) {
    const endMsg = document.createElement("p");
    endMsg.textContent = "🌙 " + scene.ending;
    choices.appendChild(endMsg);
    return; // 엔딩 장면이면 선택지 버튼을 만들지 않음
  }

  // 선택지가 없는 경우 (예: 자동으로 다음 장면으로 넘어가는 경우)
  // JSON 파일에서 "next" 키 안에 다음 장면 ID를 지정하는 방식으로 통일했을 때 이 로직 사용
  if (Object.keys(scene).filter(key => key.startsWith('q')).length === 0 && scene.next) {
      const nextKey = Object.keys(scene.next)[0]; // next 객체의 첫 번째 키를 사용
      const nextSceneId = scene.next[nextKey];
      if (nextSceneId) {
           const continueBtn = document.createElement("button");
           continueBtn.textContent = "계속"; // 또는 "다음으로" 등
           continueBtn.onclick = () => {
               renderScene(story, chapter, nextSceneId);
           };
           choices.appendChild(continueBtn);
      } else {
           console.error("Invalid next scene configuration for scene:", sceneId);
           const errorMsg = document.createElement("p");
           errorMsg.textContent = "스토리 연결 오류: 다음 장면 ID가 정의되지 않았습니다.";
           choices.appendChild(errorMsg);
      }
      return; // 선택지 버튼 생성 루프를 건너뜜
  }


  // 선택지가 있는 경우 (q로 시작하는 키가 있는 경우)
  for (const key of Object.keys(scene)) {
    if (key.startsWith("q")) {
      const btn = document.createElement("button");
      btn.textContent = scene[key];
      btn.onclick = () => {
        const nextSceneId = scene.next?.[key]; // 옵셔널 체이닝과 프로퍼티 접근
        if (nextSceneId) {
          renderScene(story, chapter, nextSceneId);
        } else {
          alert("다음 장면이 아직 연결되지 않았습니다.");
          console.warn("Next scene not defined for choice:", key, "in scene:", sceneId);
        }
      };
      choices.appendChild(btn);
    }
  }
}

loadStory().then(story => {
    if (story) { // 스토리 로딩 성공 시에만 렌더링
        renderScene(story, "chapter1", currentScene);
    }
});