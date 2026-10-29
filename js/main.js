(() => {
    'use strict';

    /* ── Animation de saisie du terminal ── */
    const cmds = [
        { cmd: 'whoami',            out: 'John-Sheer — développeur full-stack et technicien réseau & vidéosurveillance, GPS tracking' },
        { cmd: 'skills --list',     out: 'full-stack · réseau · vidéosurveillance · GPS tracking' },
        { cmd: 'compétences',       out: 'React · Vite · JavaScript / TypeScript · PHP · PowerShell · Git · Python · UML · Agilité · Traceurs GPS' },
    ];
    let idx = 0;
    const termBody = document.getElementById('terminalBody');
    const terminalEl = document.querySelector('.terminal');

    /* ── Son de clavier Web Audio ── */
    let audioCtx;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    const resumeAudioCtx = () => {
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    };
    document.addEventListener('click', resumeAudioCtx);
    document.addEventListener('pointermove', resumeAudioCtx, { once: true });
    document.addEventListener('touchstart', resumeAudioCtx, { once: true });

    let clickBuf = null;
    const mkClickBuf = () => {
        const sr = audioCtx.sampleRate;
        const len = Math.floor(sr * 0.025);
        const buf = audioCtx.createBuffer(1, len, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.12));
        return buf;
    };
    const playKeySound = () => {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (!clickBuf) clickBuf = mkClickBuf();
        const src = audioCtx.createBufferSource();
        src.buffer = clickBuf;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.025, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.025);
        src.connect(g);
        g.connect(audioCtx.destination);
        src.start();
    };

    const isConsoleVisible = () => {
        if (!terminalEl || document.hidden) return false;
        const rect = terminalEl.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= window.innerHeight;
    };

    const typeCommand = (i) => {
        const entry = cmds[i];
        const cmdText = entry.cmd;
        const outText = entry.out;
        let pos = 0;
        let typedCmd = '';
        let typedOut = '';

        const p1 = document.createElement('p');
        p1.innerHTML = '<span class="prompt">PS C:\\Users\\John-Sheer&gt;</span> <span class="cmd"></span>';
        const p2 = document.createElement('p');
        p2.className = 'out';
        p2.innerHTML = '<span class="cursor blink">_</span>';
        if (termBody) {
            termBody.innerHTML = '';
            termBody.appendChild(p1);
            termBody.appendChild(p2);
        }

        const cmdSpan = p1.querySelector('.cmd');
        const outSpan = p2;

        const typeCmd = () => {
            if (pos < cmdText.length) {
                typedCmd += cmdText.charAt(pos);
                cmdSpan.textContent = typedCmd;
                if (isConsoleVisible()) playKeySound();
                pos++;
                setTimeout(typeCmd, 140 + Math.random() * 100);
            } else {
                pos = 0;
                setTimeout(typeOut, 200);
            }
        };

        const typeOut = () => {
            if (pos < outText.length) {
                typedOut += outText.charAt(pos);
                outSpan.innerHTML = typedOut + '<span class="cursor blink">_</span>';
                if (isConsoleVisible()) playKeySound();
                pos++;
                if (termBody) termBody.scrollTop = termBody.scrollHeight;
                setTimeout(typeOut, 80 + Math.random() * 60);
            }
        };

        typeCmd();
    };

    if (termBody) {
        typeCommand(0);
        let animPaused = false;
        setInterval(() => {
            if (!isConsoleVisible()) { animPaused = true; return; }
            if (animPaused) { animPaused = false; typeCommand(idx); return; }
            idx = (idx + 1) % cmds.length;
            typeCommand(idx);
        }, 13000);
    }

    /* ── Apparition au scroll ── */
    const els = document.querySelectorAll('.reveal');
    if (els.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        els.forEach((el) => { observer.observe(el); });
    } else {
        els.forEach((el) => { el.classList.add('visible'); });
    }

    /* ── Nav active ── */
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = [];
    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
            const section = document.getElementById(href.slice(1));
            if (section) sections.push({ el: section, link });
        }
    });
    if (sections.length && 'IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver(() => {
            let current = '';
            sections.forEach((s) => {
                const rect = s.el.getBoundingClientRect();
                if (rect.top <= 150) current = s.el.id;
            });
            navLinks.forEach((l) => { l.style.color = ''; });
            const active = document.querySelector(`.nav-links a[href="#${current}"]`);
            if (active) active.style.color = 'var(--emerald)';
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
        sections.forEach((s) => { navObserver.observe(s.el); });
    }

    /* ── Message prompt ── */
    const msgField2 = document.getElementById('message');
    const nameField = document.getElementById('name');
    const msgPrompt = document.getElementById('msgPrompt');
    const promptLabel = document.querySelector('.prompt-label');
    const promptCmd = document.querySelector('.prompt-cmd');
    const msgOverlay = document.getElementById('msgOverlay');

    const autoResize = (el) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    const updateMsgPrompt = () => {
        if (!msgPrompt) return;
        const name = nameField ? nameField.value.trim().replace(/\s+/g, '_') || 'votreNom' : 'votreNom';
        const typed = msgField2 ? msgField2.value : '';
        if (promptLabel) promptLabel.textContent = `PS C:\\John-Sheer\\Devis\\${name}> `;
        if (promptCmd) promptCmd.textContent = typed ? ' message' : '';
    };

    const escapeHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const msgRenderOverlay = () => {
        if (!msgField2 || !msgOverlay) return;
        const val = msgField2.value;
        let html;
        if (!val && document.activeElement !== msgField2) {
            html = '<span style="color:rgba(255,255,255,0.15)">Décris ton projet...</span>';
        } else {
            html = escapeHtml(val);
            if (document.activeElement === msgField2) {
                html += '<span class="cursor">\u2581</span>';
            }
        }
        msgOverlay.innerHTML = html;
    };

    if (msgField2 && msgOverlay) {
        autoResize(msgField2);
        msgField2.addEventListener('focus', () => {
            updateMsgPrompt();
            if (msgPrompt) msgPrompt.classList.add('visible');
            msgRenderOverlay();
            autoResize(msgField2);
        });
        msgField2.addEventListener('blur', () => {
            msgRenderOverlay();
            if (!msgField2.value.trim() && msgPrompt) {
                msgPrompt.classList.remove('visible');
            }
            autoResize(msgField2);
        });
        msgField2.addEventListener('input', () => {
            msgRenderOverlay();
            updateMsgPrompt();
            autoResize(msgField2);
        });
        if (nameField) {
            nameField.addEventListener('input', () => {
                if (msgPrompt && msgPrompt.classList.contains('visible')) updateMsgPrompt();
            });
        }
        msgRenderOverlay();
    }

    /* ── Formulaire ── */
    const devisForm = document.querySelector('#devis form');
    if (devisForm) {
        devisForm.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                playKeySound();
            }
        });

        devisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = devisForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.textContent = 'Envoi en cours…';
                btn.disabled = true;
            }
            fetch(devisForm.action, {
                method: 'POST',
                body: new FormData(devisForm),
                headers: { 'Accept': 'application/json' }
            }).then((r) => r.json()).then((data) => {
                if (data.ok) {
                    devisForm.innerHTML =
                        '<div class="form-success">' +
                            '<div class="emoji">✓</div>' +
                            '<h3>Message envoyé !</h3>' +
                            '<p>Je te réponds sous 24h. À très vite !</p>' +
                            '<button class="btn btn-primary" id="resetDevis">OK</button>' +
                        '</div>';
                    const resetBtn = document.getElementById('resetDevis');
                    if (resetBtn) resetBtn.addEventListener('click', () => { location.reload(); });
                } else {
                    if (btn) {
                        btn.textContent = 'Réessaie';
                        btn.disabled = false;
                    }
                    alert("Erreur : " + (data.error || "Réessaie plus tard."));
                }
            }).catch(() => {
                if (btn) {
                    btn.textContent = 'Réessaie';
                    btn.disabled = false;
                }
                alert("Erreur réseau. Réessaie.");
            });
        });
    }

    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', () => {
            phoneField.value = phoneField.value.replace(/[^0-9+]/g, '');
        });
    }

    /* ── Select personnalisé ── */
    const trigger = document.getElementById('selectTrigger');
    const menu = document.getElementById('selectMenu');
    const nativeSelect = document.getElementById('service');
    if (trigger && menu && nativeSelect) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
        menu.querySelectorAll('li').forEach((li) => {
            li.addEventListener('click', () => {
                const val = li.getAttribute('data-value');
                const text = li.textContent;
                nativeSelect.value = val;
                trigger.textContent = text;
                menu.querySelectorAll('li').forEach((l) => { l.classList.remove('selected'); });
                li.classList.add('selected');
                menu.classList.remove('open');
            });
        });
        document.addEventListener('click', () => {
            menu.classList.remove('open');
        });
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /* ── Modale téléphone ── */
    const phoneCards = document.querySelectorAll('.phone-card');
    const modal = document.getElementById('phoneModal');
    const callBtn = document.getElementById('modalCall');
    const waBtn = document.getElementById('modalWhatsApp');
    const closeBtn = document.getElementById('modalClose');

    phoneCards.forEach((card) => {
        card.addEventListener('click', () => {
            if (callBtn) callBtn.href = 'tel:' + card.getAttribute('data-tel');
            if (waBtn) waBtn.href = 'https://wa.me/' + card.getAttribute('data-wa');
            if (modal) modal.classList.add('active');
        });
    });

    const closeModal = () => { if (modal) modal.classList.remove('active'); };
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    /* ── Burger menu ── */
    const burger = document.getElementById('burgerBtn');
    const burgerMenu = document.getElementById('navLinks');
    if (burger && burgerMenu) {
        burger.addEventListener('click', () => {
            burgerMenu.classList.toggle('open');
        });
        burgerMenu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => { burgerMenu.classList.remove('open'); });
        });
        document.addEventListener('click', (e) => {
            if (!burger.contains(e.target) && !burgerMenu.contains(e.target)) {
                burgerMenu.classList.remove('open');
            }
        });
    }

    /* ── Hit map photo ── */
    (() => {
        const frame = document.querySelector('.photo-frame');
        if (!frame) return;
        const img = new Image();
        img.src = 'img/John.png?' + Date.now();
        const hitmap = [];
        let iw, ih, scaleFactor;

        img.onload = () => {
            iw = img.naturalWidth;
            ih = img.naturalHeight;
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            c.width = iw;
            c.height = ih;
            if (!ctx) return;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, iw, ih).data;
            const step = 4;
            for (let y = 0; y < ih; y += step) {
                hitmap[y] = [];
                for (let x = 0; x < iw; x += step) {
                    const alpha = data[(y * iw + x) * 4 + 3];
                    hitmap[y][x] = alpha > 30;
                }
            }
            scaleFactor = step;
        };

        frame.addEventListener('mousemove', (e) => {
            if (!hitmap.length || !iw || !ih) return;
            const rect = frame.getBoundingClientRect();
            const ew = rect.width, eh = rect.height;
            const s = Math.min(ew / iw, eh / ih);
            const rw = iw * s, rh = ih * s;
            const ox = (ew - rw) / 2, oy = (eh - rh) / 2;
            const mx = e.clientX - rect.left - ox;
            const my = e.clientY - rect.top - oy;
            if (mx < 0 || my < 0 || mx >= rw || my >= rh) {
                frame.classList.remove('hover-active');
                return;
            }
            const px = Math.floor((mx / rw) * iw);
            const py = Math.floor((my / rh) * ih);
            const sy = Math.floor(py / scaleFactor) * scaleFactor;
            const sx = Math.floor(px / scaleFactor) * scaleFactor;
            const hit = hitmap[sy] && hitmap[sy][sx];
            frame.classList.toggle('hover-active', !!hit);
        });

        frame.addEventListener('mouseleave', () => {
            frame.classList.remove('hover-active');
        });
    })();
})();