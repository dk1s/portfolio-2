import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const WinterPortfolio = () => {
  const canvasRef = useRef(null);
  const project1Ref = useRef(null);
  const project2Ref = useRef(null);
  const project3Ref = useRef(null);
  const profileRef = useRef(null);
  const [snowflakes, setSnowflakes] = useState([]);
  const [stats, setStats] = useState({ projects: 0, years: 0, clients: 0, awards: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Generate snowflakes
  useEffect(() => {
    const interval = setInterval(() => {
      setSnowflakes(prev => {
        const newFlakes = [...prev, {
          id: Date.now(),
          left: Math.random() * 100,
          size: Math.random() * 10 + 10,
          duration: Math.random() * 3 + 7,
          opacity: Math.random() * 0.6 + 0.4,
          symbol: ['❄', '❅', '❆'][Math.floor(Math.random() * 3)]
        }];
        
        return newFlakes.slice(-50);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Animate stats
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          const animateValue = (key, target) => {
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setStats(prev => ({ ...prev, [key]: target }));
                clearInterval(timer);
              } else {
                setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
              }
            }, 20);
          };

          animateValue('projects', 50);
          animateValue('years', 7);
          animateValue('clients', 30);
          animateValue('awards', 15);
        }
      });
    }, { threshold: 0.3 });

    const aboutSection = document.getElementById('about');
    if (aboutSection) observer.observe(aboutSection);

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Main 3D Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1128, 0.002);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    // Particle system
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

      const color = new THREE.Color();
      color.setHSL(0.55 + Math.random() * 0.1, 0.3, 0.9);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Ice crystal shapes
    const torusGeometry = new THREE.TorusGeometry(5, 1, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0x81d4fa,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-20, 0, -30);
    scene.add(torus);

    camera.position.z = 50;

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.0001;
      particleSystem.rotation.x = time * 0.2;
      particleSystem.rotation.y = time * 0.3;

      const pos = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 0.02;
        if (pos[i + 1] < -75) pos[i + 1] = 75;
        pos[i] += Math.sin(time + i) * 0.01;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Project canvases
  useEffect(() => {
    const initCanvas = (ref, type) => {
      if (!ref.current) return;
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, ref.current.offsetWidth / ref.current.offsetHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(ref.current.offsetWidth, ref.current.offsetHeight);
      ref.current.appendChild(renderer.domElement);

      if (type === 'particles') {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(1500 * 3);
        for (let i = 0; i < 1500; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: 0xb3e5fc, size: 0.15, transparent: true, opacity: 0.8 });
        const system = new THREE.Points(particles, material);
        scene.add(system);
        camera.position.z = 15;

        const animate = () => {
          requestAnimationFrame(animate);
          system.rotation.x += 0.002;
          system.rotation.y += 0.003;
          const pos = system.geometry.attributes.position.array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] -= 0.02;
            if (pos[i + 1] < -10) pos[i + 1] = 10;
          }
          system.geometry.attributes.position.needsUpdate = true;
          renderer.render(scene, camera);
        };
        animate();
      } else if (type === 'crystal') {
        const geometry = new THREE.IcosahedronGeometry(3, 0);
        const material = new THREE.MeshBasicMaterial({ color: 0x81d4fa, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        camera.position.z = 8;

        const animate = () => {
          requestAnimationFrame(animate);
          mesh.rotation.x += 0.01;
          mesh.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        animate();
      } else if (type === 'wave') {
        const planeGeometry = new THREE.PlaneGeometry(10, 10, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xb3e5fc, wireframe: true });
        const plane = new THREE.Mesh(planeGeometry, material);
        plane.rotation.x = -Math.PI / 3;
        scene.add(plane);
        camera.position.z = 12;
        camera.position.y = 5;

        const animate = () => {
          requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          const positions = plane.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = Math.sin(x + time) * Math.cos(y + time) * 0.5;
          }
          plane.geometry.attributes.position.needsUpdate = true;
          renderer.render(scene, camera);
        };
        animate();
      }

      return () => {
        if (ref.current) {
          ref.current.removeChild(renderer.domElement);
        }
      };
    };

    initCanvas(project1Ref, 'particles');
    initCanvas(project2Ref, 'crystal');
    initCanvas(project3Ref, 'wave');
  }, []);

  // Profile canvas
  useEffect(() => {
    if (!profileRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, profileRef.current.offsetWidth / profileRef.current.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(profileRef.current.offsetWidth, profileRef.current.offsetHeight);
    profileRef.current.appendChild(renderer.domElement);

    const shapes = [];
    
    const dodecahedron = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 0),
      new THREE.MeshBasicMaterial({ color: 0x81d4fa, wireframe: true })
    );
    dodecahedron.position.set(-2, 0, 0);
    scene.add(dodecahedron);
    shapes.push(dodecahedron);

    const octahedron = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.MeshBasicMaterial({ color: 0xb3e5fc, wireframe: true })
    );
    octahedron.position.set(2, 0, 0);
    scene.add(octahedron);
    shapes.push(octahedron);

    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
      new THREE.MeshBasicMaterial({ color: 0x4fc3f7, wireframe: true })
    );
    torusKnot.position.set(0, 2, 0);
    scene.add(torusKnot);
    shapes.push(torusKnot);

    camera.position.z = 8;

    const animate = () => {
      requestAnimationFrame(animate);
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01 * (index + 1);
        shape.rotation.y += 0.01 * (index + 1);
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      profileRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(to bottom, #0a1128 0%, #1a2b4f 50%, #2d4270 100%)' }}>
      {/* Background Canvas */}
      <div ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 1 }} />

      {/* Snowfall */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
        {snowflakes.map(flake => (
          <div
            key={flake.id}
            className="absolute"
            style={{
              left: `${flake.left}%`,
              top: '-10px',
              fontSize: `${flake.size}px`,
              opacity: flake.opacity,
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
              animation: `fall ${flake.duration}s linear forwards`
            }}
          >
            {flake.symbol}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative text-white" style={{ zIndex: 10 }}>
        {/* Navigation */}
        <nav className="fixed w-full top-0 py-4 px-4" style={{ zIndex: 50 }}>
          <div className="max-w-7xl mx-auto">
            <div className="px-6 md:px-8 py-4 flex justify-between items-center rounded-3xl"
              style={{
                background: 'rgba(240, 248, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 20px rgba(173, 216, 230, 0.3)'
              }}>
              <div className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #e0f7ff 0%, #b3e5fc 25%, #81d4fa 50%, #b3e5fc 75%, #e0f7ff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>
                ❄ DEEPAK
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#home" className="hover:text-blue-200 transition font-medium">Home</a>
                <a href="#about" className="hover:text-blue-200 transition font-medium">About</a>
                <a href="#skills" className="hover:text-blue-200 transition font-medium">Skills</a>
                <a href="#projects" className="hover:text-blue-200 transition font-medium">Projects</a>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-6 py-2 rounded-full font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(129, 212, 250, 0.3), rgba(179, 229, 252, 0.3))',
                    border: '2px solid rgba(129, 212, 250, 0.5)'
                  }}>
                  Contact
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
          <div className="text-center max-w-6xl relative z-10">
            <div className="mb-4 inline-block px-6 py-2 rounded-3xl"
              style={{
                background: 'rgba(240, 248, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
              <span className="text-sm text-blue-200 font-semibold tracking-wider">❄ WINTER CREATIVE DEVELOPER</span>
            </div>
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tight leading-none"
                style={{
                  background: 'linear-gradient(135deg, #e0f7ff 0%, #b3e5fc 25%, #81d4fa 50%, #b3e5fc 75%, #e0f7ff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'iceShimmer 4s ease infinite'
                }}>
                PORTFOLIO
              </h1>
              <div className="h-1 mx-auto rounded"
                style={{
                  width: '80%',
                  background: 'linear-gradient(90deg, transparent, #81d4fa, #b3e5fc, #81d4fa, transparent)',
                  boxShadow: '0 0 20px rgba(129, 212, 250, 0.8)'
                }}></div>
            </div>
            <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 mb-12 leading-relaxed max-w-4xl mx-auto">
              Creating magical web experiences as beautiful as
              <span className="font-bold" style={{
                background: 'linear-gradient(to right, #bfdbfe, #a5f3fc)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}> freshly fallen snow</span>
              <br className="hidden md:block" />
              with cutting-edge <span className="font-bold" style={{
                background: 'linear-gradient(to right, #a5f3fc, #93c5fd)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>3D technology</span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <button
                onClick={() => scrollToSection('projects')}
                className="px-12 py-5 rounded-full font-bold text-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(129, 212, 250, 0.3), rgba(179, 229, 252, 0.3))',
                  border: '2px solid rgba(129, 212, 250, 0.5)',
                  boxShadow: '0 0 30px rgba(173, 216, 230, 0.4), 0 0 60px rgba(135, 206, 250, 0.3)'
                }}>
                View Projects ❄
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-12 py-5 rounded-full font-bold text-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(129, 212, 250, 0.3), rgba(179, 229, 252, 0.3))',
                  border: '2px solid rgba(129, 212, 250, 0.5)'
                }}>
                Let's Talk ☃
              </button>
            </div>
            <div className="flex justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Available for projects</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span>•</span>
                <span>Based in India</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-16 text-center"
              style={{
                background: 'linear-gradient(135deg, #e0f7ff 0%, #b3e5fc 25%, #81d4fa 50%, #b3e5fc 75%, #e0f7ff 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
              About Me ❄
            </h2>
            <div className="p-8 md:p-12 rounded-3xl"
              style={{
                background: 'rgba(240, 248, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 30px rgba(173, 216, 230, 0.4), 0 0 60px rgba(135, 206, 250, 0.3)'
              }}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl blur-xl opacity-30"></div>
                    <div className="relative p-8 rounded-3xl"
                      style={{
                        background: 'rgba(240, 248, 255, 0.08)',
                        backdropFilter: 'blur(30px)',
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}>
                      <div ref={profileRef} style={{ width: '100%', height: '300px' }}></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-6 text-blue-200">Winter Creative Developer</h3>
                  <p className="text-blue-100 text-lg leading-relaxed mb-6">
                    I specialize in crafting stunning 3D web experiences that are as captivating as a winter wonderland.
                    With expertise in WebGL, Three.js, and interactive design, I bring frozen beauty to digital spaces.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {[
                      { label: 'Projects Completed', value: stats.projects, suffix: '+' },
                      { label: 'Years Experience', value: stats.years, suffix: '' },
                      { label: 'Happy Clients', value: stats.clients, suffix: '+' },
                      { label: 'Awards Won', value: stats.awards, suffix: '' }
                    ].map((stat, i) => (
                      <div key={i} className="p-6 rounded-3xl hover:scale-105 transition-transform"
                        style={{
                          background: 'rgba(240, 248, 255, 0.08)',
                          backdropFilter: 'blur(30px)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 0 30px rgba(173, 216, 230, 0.4)'
                        }}>
                        <div className="text-5xl font-black mb-2"
                          style={{
                            background: 'linear-gradient(135deg, #e0f7ff, #81d4fa)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                          }}>
                          {stat.value}{stat.suffix}
                        </div>
                        <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-5xl md:text-6xl font-bold mb-16 text-center"
              style={{
                background: 'linear-gradient(135deg, #e0f7ff, #81d4fa)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
              Expertise ☃
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '🎨', title: '3D Design', desc: 'Three.js, WebGL, Blender, Cinema 4D', gradient: 'from-cyan-400 to-blue-400' },
                { icon: '💻', title: 'Development', desc: 'React, JavaScript, TypeScript, GLSL', gradient: 'from-blue-400 to-cyan-400' },
                { icon: '⚡', title: 'Animation', desc: 'GSAP, Framer Motion, Physics', gradient: 'from-cyan-300 to-blue-500' }
              ].map((skill, i) => (
                <div key={i} className="p-8 text-center hover:scale-105 transition-all rounded-3xl"
                  style={{
                    background: 'rgba(240, 248, 255, 0.08)',
                    backdropFilter: 'blur(30px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 30px rgba(173, 216, 230, 0.4)'
                  }}>
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${skill.gradient} flex items-center justify-center text-3xl`}>
                    {skill.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-100">{skill.title}</h3>
                  <p className="text-blue-200">{skill.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 rounded-3xl"
              style={{
                background: 'rgba(240, 248, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 30px rgba(173, 216, 230, 0.4)'
              }}>
              <h3 className="text-3xl font-bold mb-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, #e0f7ff, #81d4fa)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>
                Technical Skills
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { name: 'Three.js / WebGL', percent: 95, color: 'from-cyan-400 to-blue-400' },
                  { name: 'React / Next.js', percent: 92, color: 'from-blue-400 to-cyan-400' },
                  { name: 'GLSL Shaders', percent: 88, color: 'from-cyan-300 to-blue-500' },
                  { name: 'Animation (GSAP)', percent: 90, color: 'from-blue-400 to-cyan-300' }
                ].map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-blue-100">{skill.name}</span>
                      <span className="text-cyan-300">{skill.percent}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(30, 58, 138, 0.3)' }}>
                      <div
                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                        style={{
                          width: `${skill.percent}%`,
                          boxShadow: '0 0 10px rgba(129, 212, 250, 0.6)'
                        }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-5xl md:text-6xl font-bold mb-16 text-center"
              style={{
                background: 'linear-gradient(135deg, #e0f7ff, #81d4fa)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
              Featured Work ❄
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { ref: project1Ref, title: 'Winter Particle System', desc: 'Interactive snowflakes with 10,000+ particles', tags: ['Three.js', 'WebGL', 'GLSL'] },
                { ref: project2Ref, title: 'Ice Crystal Forms', desc: 'Geometry transformation with smooth transitions', tags: ['Three.js', 'Animation'] },
                { ref: project3Ref, title: 'Frozen Wave', desc: 'Procedural animation with sine waves', tags: ['Math', 'Procedural'] }
              ].map((project, i) => (
                <div key={i} className="overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:scale-105"
                  style={{
                    background: 'rgba(240, 248, 255, 0.08)',
                    backdropFilter: 'blur(30px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(129, 212, 250, 0.5), 0 0 80px rgba(173, 216, 230, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                  }}>
                  <div className="relative h-64"
                    style={{
                      background: i === 0 ? 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))' :
                        i === 1 ? 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(34, 211, 238, 0.2))' :
                          'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2))'
                    }}>
                    <div ref={project.ref} style={{ width: '100%', height: '100%' }}></div>
                    <div className="absolute inset-0 flex items-end p-6"
                      style={{ background: 'linear-gradient(to top, rgba(30, 58, 138, 0.9), transparent)' }}>
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-blue-100">{project.title}</h3>
                        <p className="text-blue-200 text-sm">{project.desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, j) => (
                        <span key={j} className="px-3 py-1 rounded-full text-xs"
                          style={{
                            background: j === 0 ? 'rgba(34, 211, 238, 0.2)' : j === 1 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                            border: j === 0 ? '1px solid rgba(34, 211, 238, 0.3)' : j === 1 ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)'
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-5xl md:text-6xl font-bold mb-16 text-center"
              style={{
                background: 'linear-gradient(135deg, #e0f7ff, #81d4fa)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
              Let's Connect ☃
            </h2>
            <div className="p-8 md:p-12 rounded-3xl"
              style={{
                background: 'rgba(240, 248, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 30px rgba(173, 216, 230, 0.4)'
              }}>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {[
                  { icon: '📧', title: 'Email', value: 'hello@deepak.dev' },
                  { icon: '💼', title: 'LinkedIn', value: '@deepakportfolio' }
                ].map((contact, i) => (
                  <div key={i} className="p-6 text-center hover:scale-105 transition-all rounded-3xl"
                    style={{
                      background: 'rgba(240, 248, 255, 0.08)',
                      backdropFilter: 'blur(30px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 0 30px rgba(173, 216, 230, 0.4)'
                    }}>
                    <div className="text-4xl mb-4">{contact.icon}</div>
                    <h3 className="font-bold mb-2 text-blue-100">{contact.title}</h3>
                    <p className="text-blue-200">{contact.value}</p>
                  </div>
                ))}
              </div>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-6 py-4 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(30, 58, 138, 0.2)',
                      border: '2px solid rgba(34, 211, 238, 0.3)',
                      color: 'white'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-6 py-4 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(30, 58, 138, 0.2)',
                      border: '2px solid rgba(34, 211, 238, 0.3)',
                      color: 'white'
                    }}
                  />
                </div>
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  className="w-full px-6 py-4 rounded-xl outline-none transition-all"
                  style={{
                    background: 'rgba(30, 58, 138, 0.2)',
                    border: '2px solid rgba(34, 211, 238, 0.3)',
                    color: 'white'
                  }}
                ></textarea>
                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(129, 212, 250, 0.3), rgba(179, 229, 252, 0.3))',
                    border: '2px solid rgba(129, 212, 250, 0.5)',
                    boxShadow: '0 0 30px rgba(173, 216, 230, 0.4)'
                  }}>
                  Send Message ❄
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4" style={{ borderTop: '1px solid rgba(34, 211, 238, 0.2)' }}>
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-3xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #e0f7ff, #81d4fa)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
              ❄ DEEPAK
            </div>
            <div className="flex justify-center space-x-6 mb-6">
              {['𝕏', 'in', 'gh'].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(240, 248, 255, 0.08)',
                    backdropFilter: 'blur(30px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 20px rgba(173, 216, 230, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34, 211, 238, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(240, 248, 255, 0.08)';
                  }}>
                  <span className="text-xl">{icon}</span>
                </a>
              ))}
            </div>
            <p className="text-blue-300">© 2025 DEEPAK Portfolio. Crafted with Three.js & Winter Magic ❄</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        @keyframes iceShimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        input::placeholder,
        textarea::placeholder {
          color: #93c5fd;
        }
        input:focus,
        textarea:focus {
          border-color: #22d3ee !important;
        }
      `}</style>
    </div>
  );
};

export default WinterPortfolio;
