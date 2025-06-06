window.onload = function () {
    // Basic Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // start with dark background
  
    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  
    // Lighting
    const light = new THREE.PointLight(0xffffff, 2, 0);
    light.position.set(0, 0, 0);
    scene.add(light);
  
    // --- 1. Background stars ---
    function createStars() {
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 1000;
      const positions = [];
  
      for (let i = 0; i < starCount; i++) {
        positions.push(
          (Math.random() - 0.5) * 2000,
          (Math.random() - 0.5) * 2000,
          (Math.random() - 0.5) * 2000
        );
      }
  
      starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
  
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }
    createStars();
  
    // Sun
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
  
    // Camera Position
    camera.position.z = 30;
  
    // Planet Data
    const clock = new THREE.Clock();
    let isPaused = false;
  
    const planetsData = [
      { name: 'Mercury', color: 0xaaaaaa, size: 0.3, distance: 4, speed: 0.02 },
      { name: 'Venus',   color: 0xffcc00, size: 0.6, distance: 6, speed: 0.015 },
      { name: 'Earth',   color: 0x0000ff, size: 0.65, distance: 8, speed: 0.01 },
      { name: 'Mars',    color: 0xff0000, size: 0.5, distance: 10, speed: 0.008 },
      { name: 'Jupiter', color: 0xff8800, size: 1.2, distance: 13, speed: 0.006 },
      { name: 'Saturn',  color: 0xffffaa, size: 1.1, distance: 16, speed: 0.004 },
      { name: 'Uranus',  color: 0x00ffff, size: 0.9, distance: 19, speed: 0.003 },
      { name: 'Neptune', color: 0x0000aa, size: 0.9, distance: 22, speed: 0.002 }
    ];
  
    const planets = [];
  
    planetsData.forEach(data => {
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: data.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        name: data.name,
        angle: Math.random() * Math.PI * 2,
        speed: data.speed,
        distance: data.distance
      };
      scene.add(mesh);
      planets.push(mesh);
    });
  
    // Add Pause/Resume Button
    const pauseBtn = document.getElementById('pauseResumeBtn');
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });
  
    // Add Speed Controls
    const controlsContainer = document.getElementById('controls');
  
    planets.forEach((planet, i) => {
      const label = document.createElement('label');
      label.innerText = `${planetsData[i].name}: `;
      label.style.display = "block";
      label.style.margin = "4px 0";
  
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0.001';
      slider.max = '0.05';
      slider.step = '0.001';
      slider.value = planet.userData.speed;
      slider.oninput = (e) => {
        planet.userData.speed = parseFloat(e.target.value);
      };
  
      label.appendChild(slider);
      controlsContainer.appendChild(label);
    });
  
    // --- 2. Tooltip for planets on hover ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0,0,0,0.7)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    tooltip.style.fontFamily = 'Arial, sans-serif';
    tooltip.style.fontSize = '14px';
    document.body.appendChild(tooltip);
  
    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets);
  
      if (intersects.length > 0) {
        const planet = intersects[0].object;
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY + 10 + 'px';
        tooltip.innerHTML = planet.userData.name;
      } else {
        tooltip.style.display = 'none';
      }
    }
  
    window.addEventListener('mousemove', onMouseMove);
  
    // --- 3. Dark/Light mode toggle button ---
    let isDark = true;
  
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Toggle Light/Dark';
    toggleBtn.style.position = 'fixed';
    toggleBtn.style.top = '10px';
    toggleBtn.style.right = '10px';
    toggleBtn.style.padding = '8px 12px';
    toggleBtn.style.zIndex = '100';
    document.body.appendChild(toggleBtn);
  
    toggleBtn.addEventListener('click', () => {
      if (isDark) {
        scene.background.set(0xffffff);
        light.color.set(0x222222);
        // Optionally adjust planet materials (make them darker or lighter)
        planets.forEach(p => p.material.color.offsetHSL(0, 0, 0.5));
      } else {
        scene.background.set(0x000000);
        light.color.set(0xffffff);
        planets.forEach(p => p.material.color.offsetHSL(0, 0, -0.5));
      }
      isDark = !isDark;
    });
  
    // --- 4. Camera zoom/move on planet click ---
    function onClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets);
  
      if (intersects.length > 0) {
        const planet = intersects[0].object;
        // Move camera to an offset position near the clicked planet
        const offset = new THREE.Vector3(0, 5, 10);
        const targetPos = planet.position.clone().add(offset);
        camera.position.copy(targetPos);
        camera.lookAt(planet.position);
      }
    }
    window.addEventListener('click', onClick);
  
    // Animate Planets
    function animate() {
      requestAnimationFrame(animate);
  
      if (!isPaused) {
        planets.forEach(planet => {
          planet.userData.angle += planet.userData.speed;
          const x = Math.cos(planet.userData.angle) * planet.userData.distance;
          const z = Math.sin(planet.userData.angle) * planet.userData.distance;
          planet.position.set(x, 0, z);
        });
      }
  
      renderer.render(scene, camera);
    }
  
    animate();
  
    // Optional: handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };
  