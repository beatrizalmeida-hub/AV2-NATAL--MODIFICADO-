// Encanto de Natal: interações do site
const money = value => value.toLocaleString('pt-BR', {
    style:'currency',currency:'BRL'
}
);
const cartKey = 'encantoNatalCart';
let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
function updateCart() {
    const el=document.getElementById('cart-count');
    if(el)el.textContent=cart.reduce((sum,item)=>sum+item.qty,0);
    localStorage.setItem(cartKey,JSON.stringify(cart));
}
function addCart(id) {
    const found=cart.find(item=>item.id===id);
    if(found)found.qty++;
    else cart.push( {
        id,qty:1
    }
    );
    updateCart();
    showModal('<h2>Adicionado à sacola!</h2><p>Seu item foi incluído. Continue explorando a coleção.</p>');
}
function productCard(p) {
    return `<article class="product-card"><img src="${p.imagem}" alt="Ilustração de ${p.nome}" loading="lazy"><div class="product-info"><small>${p.categoria}</small><h3>${p.nome}</h3><p>${p.descricao}</p><div class="price-row"><span class="price">${money(p.preco)}</span><button class="add-btn" data-add="${p.id}" aria-label="Adicionar ${p.nome} à sacola">+</button></div></div></article>`;
}
function renderProducts(list,target) {
    const el=document.getElementById(target);
    if(!el)return;
    el.innerHTML=list.map(productCard).join('')||'<p>Nenhum produto encontrado. Tente outra busca.</p>';
}
function showModal(html) {
    const modal=document.getElementById('modal');
    if(!modal)return;
    document.getElementById('modal-content').innerHTML=html;
    modal.classList.add('open');
}
document.addEventListener('click',e=> {
    const add=e.target.closest('[data-add]');
    if(add)addCart(Number(add.dataset.add));
    if(e.target.classList.contains('modal-close')||e.target.id==='modal')document.getElementById('modal')?.classList.remove('open');
}
);
updateCart();
// Página inicial: destaques do catálogo
renderProducts(produtos.filter(p=>p.destaque).slice(0,4),'featured-products');
// Página de produtos: busca, categoria e ordenação
const search=document.getElementById('search-products'), filter=document.getElementById('category-filter'), sort=document.getElementById('sort-products');
if(filter) {
    [...new Set(produtos.map(p=>p.categoria))].forEach(cat=>filter.add(new Option(cat,cat)));
}
function applyFilters() {
    if(!search)return;
    let list=[...produtos];
    const term=search.value.toLocaleLowerCase('pt-BR');
    if(term)list=list.filter(p=>p.nome.toLocaleLowerCase('pt-BR').includes(term));
    if(filter.value!=='todos')list=list.filter(p=>p.categoria===filter.value);
    if(sort.value==='low')list.sort((a,b)=>a.preco-b.preco);
    if(sort.value==='high')list.sort((a,b)=>b.preco-a.preco);
    if(sort.value==='name')list.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    renderProducts(list,'all-products');
    const count=document.getElementById('result-count');
    if(count)count.textContent=`${list.length} produto(s) encontrado(s).`;
}
if(search) {
    search.addEventListener('input',applyFilters);
    filter.addEventListener('change',applyFilters);
    sort.addEventListener('change',applyFilters);
    applyFilters();
}
// Menu hambúrguer
const menuButton=document.querySelector('.menu-btn'),header=document.getElementById('header');
menuButton?.addEventListener('click',()=> {
    const open=header.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.textContent=open?'✕':'☰';
}
);
// Slideshow/carrossel da página inicial
const slides=[...document.querySelectorAll('.slide')],dots=[...document.querySelectorAll('.dot')];
if(slides.length) {
    let currentSlide=0;
    function showSlide(index) {
        currentSlide=(index+slides.length)%slides.length;
        slides.forEach((slide,i)=>slide.classList.toggle('active',i===currentSlide));
        dots.forEach((dot,i)=>dot.classList.toggle('active',i===currentSlide));
    }
    document.querySelector('.slide-prev')?.addEventListener('click',()=>showSlide(currentSlide-1));
    document.querySelector('.slide-next')?.addEventListener('click',()=>showSlide(currentSlide+1));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>showSlide(i)));
    setInterval(()=>showSlide(currentSlide+1),5000);
}
// Parallax suave na Home
const hero=document.getElementById('parallax');
window.addEventListener('scroll',()=> {
    if(hero)hero.style.backgroundPositionY=`${window.scrollY*.18}px`;
}
);
// Botão de som: feedback sonoro gerado no navegador, sem autoplay
let audioContext=null;
document.getElementById('sound-toggle')?.addEventListener('click',()=> {
    const button=document.getElementById('sound-toggle');
    try {
        audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
        const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
        oscillator.type='sine';
        oscillator.frequency.value=880;
        gain.gain.setValueAtTime(.0001,audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(.12,audioContext.currentTime+.02);
        gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.45);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime+.46);
        button.textContent='♫ Sininho tocado!';
    }
    catch(error) {
        button.textContent='Som indisponível neste navegador';
    }
}
);
// Contagem regressiva para o próximo Natal
function updateCountdown() {
    const el=document.getElementById('countdown');
    if(!el)return;
    const now=new Date();
    let target=new Date(now.getFullYear(),11,25);
    if(now>target)target=new Date(now.getFullYear()+1,11,25);
    let seconds=Math.max(0,Math.floor((target-now)/1000));
    const days=Math.floor(seconds/86400);
    seconds%=86400;
    const hours=Math.floor(seconds/3600);
    seconds%=3600;
    const minutes=Math.floor(seconds/60);
    seconds%=60;
    el.innerHTML=`<span>${days} dias</span><span>${hours} horas</span><span>${minutes} min</span><span>${seconds} seg</span>`;
}
updateCountdown();
if(document.getElementById('countdown'))setInterval(updateCountdown,1000);
// Validação do formulário de contato
document.getElementById('contact-form')?.addEventListener('submit',event=> {
    event.preventDefault();
    const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim(),message=document.getElementById('message').value.trim(),output=document.getElementById('form-message');
    if(!name||!message||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        output.textContent='Confira o nome, o e-mail e a mensagem antes de enviar.';
        output.style.color='#b3202a';
        return;
    }
    output.textContent=`Obrigada, ${name}! Sua mensagem foi validada (demonstração escolar).`;
    output.style.color='#1f5d3a';
    event.target.reset();
}
);
// Animação ao entrar na tela
const observer=new IntersectionObserver(entries=>entries.forEach(entry=> {
    if(entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
    }
}
), {
    threshold:.12
}
);
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
// Efeito de neve leve na Home
if(document.body.querySelector('.hero')) {
    let snowCount=0;
    const snowTimer=setInterval(()=> {
        if(snowCount++>24) {
            clearInterval(snowTimer);
            return;
        }
        const flake=document.createElement('span');
        flake.className='snow';
        flake.textContent='❄';
        flake.style.left=Math.random()*100+'vw';
        flake.style.fontSize=(10+Math.random()*12)+'px';
        flake.style.animationDuration=(5+Math.random()*5)+'s';
        document.body.appendChild(flake);
        setTimeout(()=>flake.remove(),11000);
    }
    ,500);
}
// Voltar ao topo
const back=document.querySelector('.back-top');
window.addEventListener('scroll',()=>back?.classList.toggle('show',window.scrollY>450));
back?.addEventListener('click',()=>window.scrollTo( {
    top:0,behavior:'smooth'
}
));
