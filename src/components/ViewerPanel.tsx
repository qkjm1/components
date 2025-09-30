"use client";

// src/components/ViewerPanel.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/*
UI는 하단 좌측(±, 리셋)만 유지.
디버깅 로그를 상세히 추가:
- init/resize/tick 상태
- wheel/pointerdown/move/up
- click → intersect 결과, partName/partId, 외부 함수 호출 결과
회전/확대축소:
- Wheel: zoom (0.8~2.4)
- Left drag (zoom>1): pan (그룹 position x/y)
- Right drag: rotate (그룹 rotation x/y)
*/

type Props = {
  title: string;
  focus: string;
  src: string; // 사용하지 않지만 시그니처 유지
};

const nameToIdMap: Record<string, number> = {
  Head: 1,
  Neck_Shoulder_B: 2,
  Neck_Shoulder_F: 3,
  Arms: 4,
  Chest_B: 5,
  Chest_F: 6,
  Pelvic: 7,
  Legs_F: 8,
  Legs_B: 9,
  Calf: 10,
};

const queryToName: Record<string, string> = {
  Head: "편두통+후두하근",
  Neck_Shoulder_B: "어깨통증+회전근개",
  Neck_Shoulder_F: "둥근어깨+쇄골통증",
  Arms: "테니스엘보+골프엘보+손목터널증후군",
  Chest_B: "척추측만증+강직성척추염+추간판탈출증",
  Chest_F: "코어운동",
  Pelvic: "궁둥구멍증후군",
  Legs_F: "대퇴근통증",
  Legs_B: "햄스트링통증",
  Calf: "발목통증+종아리신경병증+족저근막염",
};

const ZOOM_MIN = 0.8;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.1;

export default function ViewerPanel({ title }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // pan offset
  const canPan = zoom > 1;

  // three refs
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // interaction refs
  const isPanningRef = useRef(false);
  const isRotatingRef = useRef(false);
  const mouseButtonRef = useRef<0 | 1 | 2 | null>(null); // 0: left, 2: right
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // stable reads
  const offsetRef = useRef(offset);
  const canPanRef = useRef(canPan);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { canPanRef.current = canPan; }, [canPan]);

  const baseZRef = useRef(9);

  // picking
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseNdcRef = useRef(new THREE.Vector2());
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);

  // (시각적 잔재 – 실제 제어는 three)
  const transform = useMemo(
    () => `translateX(calc(-50% + ${offset.x}px)) translateY(${offset.y}px) scale(${zoom})`,
    [zoom, offset]
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    console.debug("[ViewerPanel] init");

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera
    const width = host.clientWidth;
    const height = host.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, baseZRef.current); // ★ 카메라 y 살짝 올림
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(-2, 6, 6);     // ★ 방향/높이 명시
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 50;
    (dir.shadow.camera as THREE.OrthographicCamera).left = -20;
    (dir.shadow.camera as THREE.OrthographicCamera).right = 20;
    (dir.shadow.camera as THREE.OrthographicCamera).top = 20;
    (dir.shadow.camera as THREE.OrthographicCamera).bottom = -20;
    scene.add(dir);
    // dir.target을 중앙으로
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 1, 0);
    scene.add(lightTarget);
    dir.target = lightTarget;

    const amb = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(amb);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    ground.position.y = 0;          // ★ 바닥은 y=0으로 고정
    ground.receiveShadow = true;
    scene.add(ground);

    // Model Group
    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    scene.add(group);
    modelGroupRef.current = group;

    // Load GLB
    const loader = new GLTFLoader();
    const MODEL_URL = new URL("../models/QK7.glb", import.meta.url).href;
    loader.load(
      MODEL_URL,
      (gltf) => {
        const root = gltf.scene;

        // 재질/그림자 설정
        const names: string[] = [];
        root.traverse((child: any) => {
          if (child.isMesh) {
            child.userData.name = child.name;
            names.push(child.name || "(noname)");
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = child.material?.clone?.() ?? child.material;
            if (child.material?.color) child.material.color.set("#9AA3AF");
            child.material.side = THREE.DoubleSide;
            child.material.depthWrite = true;
          }
        });

        root.scale.set(3.0, 3.0, 3.0);

        // ★★★★★ 정렬 핵심: 모델을 '원점'과 '바닥(y=0)'에 맞추기
        // 1) 전체 바운딩 박스 계산
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        console.debug("[Model] bbox size=", size, "center=", center, "minY=", box.min.y);

        // 2) x/z 중심을 원점에, 3) 발바닥이 y=0에 오도록 이동
        root.position.x -= center.x;
        root.position.z -= center.z;
        root.position.y -= box.min.y; // (minY를 0으로 올림)

        // 그룹에 추가
        group.add(root);

        // 4) 카메라 시선/컨트롤 타깃을 모델 중앙으로
        //    (기준이 바닥 기준으로 재정렬됐으니 중앙은 height/2 지점)
        const targetY = size.y * 0.5;
        controlsRef.current?.target.set(0, targetY, 0);
        controlsRef.current?.update();
        cameraRef.current?.lookAt(0, targetY, 0);

        console.debug("[ViewerPanel] model loaded. names:", names);
      },
      (ev) => console.debug("[ViewerPanel] loading...", ev?.loaded, "/", ev?.total),
      (err) => console.error("[ViewerPanel] GLB load error:", err)
    );

    // OrbitControls (회전/줌 비활성 – 사용할 땐 직접 회전)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
    controlsRef.current = controls;

    // Canvas events
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "auto";
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

    // Wheel zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      setZoom((z) => {
        const nz = clampZoom(z + (delta > 0 ? -ZOOM_STEP : ZOOM_STEP));
        console.debug("[Wheel]", { delta, prev: z, next: nz });
        return nz;
      });
    };

    // Pointer down
    const onPointerDown = (e: PointerEvent) => {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      mouseButtonRef.current = e.button as 0 | 1 | 2;
      console.debug("[PointerDown]", { button: e.button, x: e.clientX, y: e.clientY, canPan: canPanRef.current });

      if (e.button === 2) { // right: rotate
        (e.target as Element).setPointerCapture?.(e.pointerId);
        isRotatingRef.current = true;
        rotOriginRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      if (e.button === 0 && canPanRef.current) { // left: pan when zoomed in
        (e.target as Element).setPointerCapture?.(e.pointerId);
        isPanningRef.current = true;
        dragOriginRef.current = { ...offsetRef.current };
      }
    };

    // Pointer move
    const onPointerMove = (e: PointerEvent) => {
      if (isRotatingRef.current && modelGroupRef.current) {
        const dx = e.clientX - rotOriginRef.current.x;
        const dy = e.clientY - rotOriginRef.current.y;
        rotOriginRef.current = { x: e.clientX, y: e.clientY };

        modelGroupRef.current.rotation.y += dx * 0.01;
        modelGroupRef.current.rotation.x += dy * 0.01;
        modelGroupRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, modelGroupRef.current.rotation.x));
      }

      if (isPanningRef.current) {
        const dx = (e.clientX - (dragStartRef.current?.x ?? e.clientX)) / 2;
        const dy = (e.clientY - (dragStartRef.current?.y ?? e.clientY)) / 2;
        const next = { x: dragOriginRef.current.x + dx, y: dragOriginRef.current.y + dy };
        setOffset(next);
        offsetRef.current = next;
      }
    };

    // Pointer up
    const onPointerUp = (e: PointerEvent) => {
      if (isRotatingRef.current || isPanningRef.current) {
        console.debug("[PointerUp] end drag");
      }
      isRotatingRef.current = false;
      isPanningRef.current = false;
      mouseButtonRef.current = null;
      try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    };

    // Click (picking)
    const onClick = (e: MouseEvent) => {
      const start = dragStartRef.current;
      const moved = start && (Math.abs(e.clientX - start.x) > 4 || Math.abs(e.clientY - start.y) > 4);
      if (isPanningRef.current || isRotatingRef.current || moved) return;

      const rect = canvas.getBoundingClientRect();
      const ndc = mouseNdcRef.current;
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(ndc, camera);

      const group = modelGroupRef.current;
      if (!group) return;

      const intersects = raycaster.intersectObjects([group], true);
      console.debug("[Click] intersects", intersects.length);
      if (intersects.length === 0) return;

      const clicked = intersects[0].object as THREE.Mesh;
      const partName: string = (clicked.userData?.name || clicked.name) as string;
      console.debug("[Click] hit", { name: partName, mesh: clicked });

      const partId = nameToIdMap[partName];
      const query = queryToName[partName];

      // highlight reset
      group.traverse((child: any) => {
        if (child.isMesh) {
          child.material = child.material?.clone?.() ?? child.material;
          child.material.color?.set?.("#9AA3AF");
          child.material.side = THREE.DoubleSide;
          child.material.depthWrite = true;
        }
      });

      clicked.material = clicked.material?.clone?.() ?? clicked.material;
      (clicked.material as any).color?.set?.("#9A5F61");
      selectedMeshRef.current = clicked;

      // 외부 연동
      const w = window as any;
      try {
        if (typeof w.InfoArticle__get === "function" && partId != null) {
          console.debug("[Ext] InfoArticle__get(", partId, ")");
          w.InfoArticle__get(partId);
        } else {
          console.debug("[Ext] InfoArticle__get not found");
        }
      } catch (err) {
        console.warn("[Ext] InfoArticle__get error:", err);
      }
      try {
        if (typeof w.youtubeList__get === "function" && query && partId != null) {
          console.debug("[Ext] youtubeList__get(", query, partId, ")");
          w.youtubeList__get(query, partId);
        } else {
          console.debug("[Ext] youtubeList__get not found");
        }
      } catch (err) {
        console.warn("[Ext] youtubeList__get error:", err);
      }
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("click", onClick);

    // Resize
    const onResize = () => {
      if (!host || !cameraRef.current || !rendererRef.current) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      console.debug("[Resize]", { w, h });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    // Loop
    let raf = 0;
    const tick = () => {
      if (modelGroupRef.current) {
        modelGroupRef.current.position.x = offsetRef.current.x * 0.01;
        modelGroupRef.current.position.y = -offsetRef.current.y * 0.01;
      }
      if (cameraRef.current) {
        cameraRef.current.position.z = baseZRef.current / zoom; // ★ 줌 반영 정상화(0.8~2.4 모두 반영)
      }
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();

      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("click", onClick);

      controls.dispose();
      renderer.dispose();
      try { host.removeChild(renderer.domElement); } catch {}

      scene.traverse((obj) => {
        const anyObj = obj as any;
        if (anyObj.geometry) anyObj.geometry.dispose?.();
        if (anyObj.material) {
          const m = anyObj.material;
          if (Array.isArray(m)) m.forEach((mm: any) => mm.dispose?.());
          else m.dispose?.();
        }
      });
      console.debug("[ViewerPanel] cleanup");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // UI 컨트롤(유지)
  const incZoom = () => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  const decZoom = () => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const resetView = () => {
    setZoom(1);
    const zero = { x: 0, y: 0 };
    setOffset(zero);
    offsetRef.current = zero;
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
      modelGroupRef.current.position.set(0, 0, 0);
    }
    console.debug("[Reset]");
  };

  return (
    <section className="card h-[640px] relative overflow-hidden bg-gradient-to-b from-indigo-50 to-slate-50 border shadow-[0_1px_1px_rgba(18,44,85,.06),0_30px_60px_rgba(18,44,85,.10)]">
      {/* WebGL host */}
      <div
        ref={hostRef}
        className="absolute inset-0 z-0 select-none pointer-events-auto rounded-[inherit] overflow-hidden"
        style={{ touchAction: "none" }}
        aria-label={title || "3D Viewer"}
      />

      {/* 하단 좌측: 줌 컨트롤 */}
      <div className="absolute left-3 bottom-3 flex gap-2 bg-white/70 border border-white rounded-full p-1 shadow z-20">
        <button className="iconbtn" onClick={(e) => { e.stopPropagation(); decZoom(); }}>−</button>
        <button className="iconbtn" onClick={(e) => { e.stopPropagation(); incZoom(); }}>＋</button>
        <button className="iconbtn" onClick={(e) => { e.stopPropagation(); resetView(); }} title="Reset view">⤾</button>
      </div>
    </section>
  );
}
