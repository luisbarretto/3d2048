//////////////////////////////
// DEFINIÇÃO DAS CONSTANTES //
//////////////////////////////

	// Valor de PI
	const Pi = Math.PI;

	// Dimensões dos Grids
    const L   = [3, 3, 3];
	
	// Limite do jogo (máximo de 13)
	const Mlv = 11; 

	// Rotações dos objetos
	const Rtx = [Pi, 0, -Pi/2];
	const Rtt = [4*Pi/5, 0, Pi/4];

	// Parâmetros da esfera
	const Dfn=20;
	const Crc=20;
	
	// Gradiente de cores
	const Grd = [ white   = '#FFFFFF',
			      cyan    = '#00FFFF',
				  green   = '#00FF00',
				  yellow  = '#FFFF00',
				  orange  = '#FFA500',
				  red     = '#FF0000',
				  magenta = '#FF00FF',
				  purple  = '#A500FF',
				  blue    = '#0000FF',
				  gray    = '#808080',
				  d_gray  = '#404040',
				  l_black = '#202020',
				  m_black = '#101010',
				  black   = '#000000',
				  l_gray  = '#B0B0B0' ];
	
	// Vértices do caractere de 16 segmentos
	const Svr = [[1,0,0], [0,0,0], [-1,0,0], [1,1/2,0], [0,1/2,0], [-1,1/2,0], [1,1,0], [0,1,0], [-1,1,0]];
	
	// Vértices, arestas e faces da esfera
	const Evr = DeepCreate([Dfn*Crc]);
	const Eed = DeepCreate([2*Crc*Dfn - Dfn]);
	const Efa = DeepCreate([Dfn*Crc] - Dfn);

	// Vértices, arestas e faces do quadrado
	const Qvr = DeepCreate(4);
	const Qed = DeepCreate(4);
	const Qfa = [[0,1,2,3]];

	// Canvas e suas dimensões
	const Can = document.getElementById('canvas');	
	const Ctx = Can.getContext('2d');				
	const Wid = Can.width;							
	const Hei = Can.height;				

/////////////////////////////
// DEFINIÇÃO DAS VARIÁVEIS //
/////////////////////////////

	let Brd = DeepCreate(L);		// Matriz tridimensional que armazena o tabuleiro
	let appliedZoomPercent = 1;		// Zoom da tela
	let Pos, Rot, Dim;				// Posição, rotação e dimensões dos objetos

////////////////////////
// PROGRAMA PRINCIPAL //
////////////////////////

	document.addEventListener("keydown", Keyboard);
	document.addEventListener("mousedown", Mouse);
	window.addEventListener("resize", orientatiOnChange)
	orientatiOnChange();

	Square();
	Sphere();
	New(Brd);
	New(Brd);
	RenderGame();

/////////////////
// SUB-ROTINAS //
/////////////////
	
	////////////////////////////////////////////////////////////////////////
	// Rotina que ajusta o Aspect Fit do canvas na tela disponível
	function orientatiOnChange() 
	{
		const canvasWidth = 1900;
		const canvasHeight = 950;
		const heightPercent = window.innerHeight / canvasHeight;
		const widthPercent = window.innerWidth / canvasWidth;

		appliedZoomPercent = Math.min(heightPercent, widthPercent);

		document.body.style = "";
		document.body.style.setProperty("zoom", `${appliedZoomPercent * 100}%`);
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que cria uma matriz multidimensional
	function DeepCreate
	(
		dim, 		// vetor com as dimensões da matriz
		val = 0		// valor atribuído a cada elemento 
	)
	{
		// Define o tamanho do vetor
		let v = new Array(dim[0]);

		// Para cada elemento, copia o valor ou define o nível inferior
		for(let i=0; i<dim[0]; i++)
			v[i] = dim.length === 1 ? DeepCopy(val) : DeepCreate(dim.slice(1,dim.length), val);
		
		// Retorna o vetor
		return v;
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que copia uma matriz multidimensional
	function DeepCopy
	(
		mat		// matriz a ser copiada
	)
	{
		// Se é um vetor, copia cada elemento do nível inferior
		if(Array.isArray(mat))
			return mat.map(DeepCopy);
		else 
			return mat;
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que compara duas matrizes multidimensionais
	function DeepCmp
	(
		m1, 	// matriz a ser comparada
		m2		// matriz a ser comparada
	)
	{
		// Se são vetores de mesmo tamanho, compara cada elemento
		if(Array.isArray(m1) && Array.isArray(m2) && m1.length === m2.length)
		{
			for(let i=0; i<m1.length; i++)
				if(!DeepCmp(m1[i], m2[i]))
					return false;
					
			return true;
		}
		else return m1 === m2;
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que imprime uma matriz multidimensional (apenas para debug)
	function DeepPrint
	(
		mat		// matriz a ser impressa
	)
	{
		// Se é um vetor, imprime cada elemento do nível inferior
		if(Array.isArray(mat))
		{
			document.write("[ ");
			mat.map(DeepPrint);
			document.write(" ]");
		}
		else document.write(" "+mat);
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina de sorteio de um número
	function RandInt
	(
		min,	// valor inicial
		max		// valor final
	) 
	{ 
		return Math.floor(Math.random() * (max-min+1) + min);
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina de cálculo dos vértices e arestas do quadrado
	function Square()
	{
		for(let i=0; i<4; i++)
		{
			const ang = (2*i+1) * Pi/4;
			Qvr[i] = [Math.sin(ang) * 2/3, Math.cos(ang) * 2/3, 0];
			Qed[i] = [i === 0 ? 3 : i-1, i];
		}
	}
	
	////////////////////////////////////////////////////////////////////////
	// Rotina de cálculo dos vértices e arestas e faces da "esfera"
	function Sphere()
	{
		for(let i=0; i<Dfn; i++)
		{
			for(let j=0; j<Crc; j++)
			{
				const an1 = Pi*j / (Crc-1);
				const an2 = 2*Pi*i/Dfn;
				Evr[j*Dfn+i] = [ Math.sin(an1)*Math.cos(an2)/4, Math.sin(an1)*Math.sin(an2)/4, Math.cos(an1)/4];
				Eed[i*Crc+j] = [j*Dfn+(i === 0 ? Dfn: i)-1, j*Dfn+i];

				if(j !== Crc-1)
				{
					const cnd = (i === 0 ? Dfn: i)-1;
					Eed[Dfn*Crc + i * (Crc-1) + j] = [j*Dfn+i, j*Dfn+i+Dfn];
					Efa[i * (Crc-1) + j] = [j*Dfn+cnd, j*Dfn+i, j*Dfn+i+Dfn, j*Dfn+cnd+Dfn];
				}
			}
		}
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que renderiza a tela do jogo
	function RenderGame()
	{
		// Limpa o canvas oculto
		Ctx.fillStyle = white;
		Ctx.fillRect(0, 0, Wid, Hei);

		// Renderiza o tabuleiro tridimensional e as esferas
		Rot = Rtt;
		Pos = [Wid/2-100, Hei/2-150, 3];
		Dim = [1, 1, 1];
		
		for(let i=0; i<3; i++)
			for(let j=0; j<3; j++)
				RenderObject(Qvr, Qed, [],	[(i-1),(j-1),-1], false, black, black, 5);

		for(let i=0; i<3; i++)
			for(let j=0; j<3; j++)
				for(let k=0; k<3; k++)
					RenderObject(Evr, Eed, Efa, [(i-1),(1-j),(k-2)/2], true, l_gray, Grd[Brd[k][j][i]], 1);

		// Renderiza o tabuleiro bidimensional
		Rot = Rtx;
		Pos = [Wid/10, Hei-170, 15];
		
		for(let i=0; i<3; i++)
			for(let j=0; j<3; j++)
				for(let k=0; k<3; k++)
					RenderObject(Qvr, Qed, Qfa, [(1-i)-3.2*k,(1-j),-1], true, black, Grd[Brd[k][2-j][i]], 3);

		// Renderiza os botões

		Pos = [Wid-400, Hei/2, 2];
		Dim = [1.2, 1, 1];
		
		for(let i=0; i<3; i++)
			for(let j=0; j<2; j++)
					RenderObject(Qvr, Qed, Qfa, [(1-i),(1-j),-1], false, black, black, 3);
					
		// Imprime o texto dos botões
					
		Rot = Rtt;
		seq = ["a","<","w","^",">","v"];

		for(let i=0; i<2; i++)
			for(let j=0; j<3; j++)
				Print(seq[3*i+j], [1450+250*i, 175+300*j, 10], true, black, 10);

		// Imprime o texto do tabuleiro bidimensional

		for(let i=0; i<3; i++)
			for(let j=0; j<3; j++)
				for(let k=0; k<3; k++)
					if(Brd[k][j][2-i] !== 0)
						Print(" "+(Brd[k][j][2-i]), [82+94*j, 685+94*i-305*k, 70], true, Brd[k][j][2-i]>9?white:black);

		// Imprime o título e o placar
		let t3d = [350, 70, 50];
		let plc = Math.pow(2,Max(Brd));
		let max = Math.pow(2,Mlv);
		
		if(plc<max)
		{
			Print("3d-"+max, t3d, false, black, 16, 60);
			Print("3d-"+max, t3d, false, red, 8, 60);
			t3d = [400, Hei-90, 35];
			Print(plc.toString(), t3d, false, black, 25, 80);
			Print(plc.toString(), t3d, false, red, 15, 80);
		}
		else
		{
			t3d = [Wid/2+80, Hei/2, 2];
			Print(max.toString(), t3d, true, white, 120, 450);
			Print(max.toString(), t3d, true, black, 100, 450);
			Print(max.toString(), t3d, true, red, 60, 450);
		}
			
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que procura o maior elemento da matriz 3d
	function Max
	(
		dat		// Matriz a ser verificada
	)
	{
		let max = 0;

		for(let i=0; i<3; i++)
			for(let j=0; j<3; j++)
				for(let k=0; k<3; k++)
					if(dat[i][j][k] > max)
						max = dat[i][j][k];
						
		return max;
	}
	
	////////////////////////////////////////////////////////////////////////
	// Rotina que renderiza um objeto 3D
	function RenderObject
	(
		vrt, 		// vértices do objeto
		edg, 		// arestas do objeto
		fac, 		// faces do objeto
		dsp, 		// deslocamento do objeto em 3D
		fil=false, 	// impressão das faces do objeto
		ced=gray, 	// cor das arestas
		cfa=black, 	// cor das faces
		wid=3		// largura do traço
	)
	{
		// Calcula os senos e cossenos do vetor de rotação do objeto
		let sin = Rot.map(Math.sin);
		let cos = Rot.map(Math.cos);
		
		// Calcula as projeções dos vértices na superfície 2D
		let v2d = vrt.map(function(v) { return Project(v, dsp, sin, cos) });
		
		// Define a largura do traço
		Ctx.lineWidth = wid;
		
		// Renderiza as faces
		if(fil)
		{
			Ctx.fillStyle = cfa;
			
			// Renderiza cada face
			for(let f of fac)
			{
				Ctx.beginPath();
				Ctx.moveTo(v2d[f[3]][0], v2d[f[3]][1]);
				f.map(function(v) { Ctx.lineTo(v2d[v][0], v2d[v][1]) });
				Ctx.fill();
			}
		}

		// Renderiza as arestas
		if(wid !== 0)
		{
			Ctx.strokeStyle = ced;

			// Renderiza cada aresta
			for(let e of edg)
			{
				Ctx.beginPath();
				Ctx.moveTo(v2d[e[0]][0], v2d[e[0]][1]);
    			Ctx.lineTo(v2d[e[1]][0], v2d[e[1]][1]);
				Ctx.stroke();
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////
	// Rotina que projeta um ponto 3D em uma superfície 2D
	function Project
	(
		vrt, 	// vértice a ser projetado
		dsp, 	// deslocamento do objeto em 3D
		sin, 	// vetor com o seno da rotação do objeto
		cos		// vetor com o cosseno da rotação do objeto
	)
	{
		let p = vrt.map(function(v,i) { return (v+dsp[i]) * Dim[i]; });
       	let f = 10*(200/((((p[2]*cos[1]+(p[0]*cos[2]-sin[2]*p[1])*sin[1])
				*cos[0]+(p[1]*cos[2]+p[0]*sin[2])*sin[0])+5)+Pos[2]));
       	let x = ((p[0]*cos[2]-sin[2]*p[1])*cos[1]-p[2]*sin[1])*f+Pos[0];
      	let y = ((p[1]*cos[2]+p[0]*sin[2])*cos[0]-(p[2]*cos[1]+(p[0]*cos[2]
				-sin[2]*p[1])*sin[1])*sin[0])*f+Pos[1];	

    	return [x, y];
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que imprime uma string de 16 segmentos
	function Print
	(
		str, 		// string a ser exibida
		pos, 		// posição do texto
		cen=true, 	// alinhamento do texto
		col=black,  // cor do texto
		wid=6, 		// largura do traço
		spc=40		// espaço entre caracteres
	)
	{
		// Calcula a posição inicial do texto
		[Pos, Rot, Dim] = [DeepCopy(pos), Rtx, [1, 1, 1]];
        Pos[0] -= spc * (cen ? str.length/2 : 0);

		// Renderiza cada caractere e calcula a posição seguinte
		for(let ch of str)
		{
			RenderObject(Svr, Sg16(ch), [], [0,0,0], false, col, col, wid);
            Pos[0] += spc;
		}
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que retorna as arestas dos caracteres de 16 segmentos
	function Sg16
	(
		chr		// caractere a ser impresso
	)
	{
		switch(chr)
		{
			case '-': return [[1,4], [4,7]];
            case '0': return [[0,2], [6,8], [0,6], [2,8]];
            case '1': return [[6,7], [7,8]];
            case '2': return [[0,1], [7,8], [0,6], [1,7], [2,8]];
            case '3': return [[6,8], [0,6], [1,7], [2,8]];
            case '4': return [[1,2], [6,8], [1,7]];
            case '5': return [[1,2], [6,7], [0,6], [1,7], [2,8]];
            case '6': return [[0,2], [6,7], [0,6], [1,7], [2,8]];
            case '7': return [[6,8], [2,8]];
            case '8': return [[0,2], [6,8], [0,6], [1,7], [2,8]];
            case '9': return [[1,2], [6,8], [0,6], [1,7], [2,8]];
            case 'A': return [[0,2], [6,8], [1,7], [2,8]];
            case 'B': return [[3,5], [6,8], [0,6], [4,7], [2,8]];
            case 'C': return [[0,2], [0,6], [2,8]];
            case 'D': return [[3,5], [6,8], [0,6], [2,8]];
            case 'E': return [[0,2], [0,6], [1,4], [2,8]];
            case 'F': return [[0,2], [1,4], [2,8]];
            case 'G': return [[0,2], [6,7], [0,6], [4,7], [2,8]];
            case 'H': return [[0,2], [6,8], [1,7]];
            case 'I': return [[3,5], [0,6], [2,8]];
            case 'J': return [[0,1], [6,8], [0,6]];
            case 'K': return [[0,2], [1,4], [4,6], [4,8]];
            case 'L': return [[0,2], [0,6]];
            case 'M': return [[0,2], [6,8], [2,4], [4,8]];
            case 'N': return [[0,2], [6,8], [2,6]];
            case 'O': return [[0,2], [6,8], [0,6], [2,8]];;
            case 'P': return [[0,2], [7,8], [1,7], [2,8]];
            case 'Q': return [[0,2], [6,8], [0,6], [2,8], [4,6]];
            case 'R': return [[0,2], [7,8], [1,7], [2,8], [4,6]];
            case 'S': return [[1,2], [6,7], [0,6], [1,7], [2,8]];
            case 'T': return [[3,5], [2,8]];
            case 'U': return [[0,2], [6,8], [0,6]];
            case 'V': return [[0,2], [0,8]];
            case 'W': return [[0,2], [6,8], [0,4], [4,6]];
            case 'X': return [[0,8], [2,6]];
            case 'Y': return [[2,4], [4,8], [3,4]];
            case 'Z': return [[0,6], [2,8], [0,8]];
			case 'd': return [[0,1], [0,6], [1,7], [6,8]];
			case '<': return [[1,3], [1,5], [1,7]];
			case '^': return [[1,5], [5,7], [3,5]];
			case 'v': return [[1,3], [3,7], [3,5]];
			case '>': return [[3,7], [5,7], [1,7]];
			case 'w': return [[2,4], [4,8], [1,3], [3,7]];
			case 'a': return [[0,4], [4,6], [1,5], [5,7]];
		}
		return [];
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina de tratamento dos eventos do teclado
	function Keyboard
	(
		evt		// evento acionado
	)
	{
		cln = DeepCopy(Brd);
	
		if(Max(Brd) < Mlv)
		{
			switch(evt.keyCode)
			{
				case 33: Move([ 0, 0,-1], 2); break;	// Move para a camada superior
				case 34: Move([ 0, 0, 1], 2); break;   	// Move para a camada inferior
				case 37: Move([ 0, 1, 0], 1); break;	// Move para a esquerda
				case 38: Move([-1, 0, 0], 0); break;	// Move para cima
				case 39: Move([ 0,-1, 0], 1); break;	// Move para a direita
				case 40: Move([ 1, 0, 0], 0); break;	// Move para baixo
				default: return;
			}
		}
		
		if(!Full(Brd) && !DeepCmp(Brd, cln))
			New(Brd);
			
		RenderGame();
	}
	
	////////////////////////////////////////////////////////////////////////
	// Rotina de tratamento dos eventos do mouse
	function Mouse
	(
		evt		// evento acionado
	)
	{
		cln = DeepCopy(Brd);
	
		const buttonsWidth = 250 * appliedZoomPercent;
		const buttonsHeight = 295 * appliedZoomPercent;
		const buttonsOffsetX = 1400 * appliedZoomPercent;
		const buttonsOffsetY = 35 * appliedZoomPercent;

		const { offsetX, offsetY } = evt;
		
		const btx = Math.floor((offsetX - buttonsOffsetX) / buttonsWidth);
		const bty = Math.floor((offsetY - buttonsOffsetY) / buttonsHeight);

		if(Max(Brd) < Mlv)
		{
			if(btx < 0) return;

			if(btx === 0)
			{
				switch(bty)
				{
					case 0: Move([ 0, 0, -1], 2); break;
					case 1: Move([ 0, 1,  0], 1); break;
					case 2: Move([ 0, 0,  1], 2); break;
				}
			}
		
			if(btx === 1)
			{
				switch(bty)
				{
					case 0: Move([-1, 0, 0], 0); break;
					case 1: Move([ 0,-1, 0], 1); break;
					case 2: Move([ 1, 0, 0], 0); break;
				}
			}
		}
				
		if(!Full(Brd) && !DeepCmp(Brd, cln))
			New(Brd);
			
		RenderGame();
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que acrescenta um novo número ao jogo
	function New
	(
		dat		// Matriz a ser acrescentado o número
	)
	{
		let i = j = k = 0;
		
		do
		{
			i = RandInt(0,2);
			j = RandInt(0,2);
			k = RandInt(0,2);
		}
		while(dat[i][j][k] !== 0);
		
		dat[i][j][k] = (RandInt(0,9) === 0 ? 2 : 1);
	}
	
	////////////////////////////////////////////////////////////////////////
	// Rotina que verifica se a matriz está completa
	function Full
	(
		dat		// Matriz a ser verificada
	)
	{
		for(let i=0; i<3; i++)
			for(let j=0; j<3; j++)
				for(let k=0; k<3; k++)
					if(dat[i][j][k] === 0)
						return false;
		
		return true;
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina de movimentação
    function Move
	(
		vec, 	// vetor de movimentação
		pos		// posição no vetor
	)
	{
		for(let i=0; i<3; i++)
		{
			for(let j=0; j<3; j++)
			{
				const p = [i, j, -1];
				Add(p[pos], p[(pos+1)%3], p[(pos+2)%3], vec[pos])
			}
		}
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina de deslocamento e adição dos números
	function Add
	(
		x, 	// coordenada X
		y, 	// coordenada Y
		z,  // coordenada Z
		or  // orientação do movimento
	)
	{
		const v = [1-or, 1, 1+or];
		const a = (x === -1 ? v : [x, x, x]);
		const b = (y === -1 ? v : [y, y, y]);
		const c = (z === -1 ? v : [z, z, z]);
	
		if(Brd[a[0]][b[0]][c[0]] === 0)
			if(Brd[a[1]][b[1]][c[1]] === 0) 							// 00A -> A00
				Change(a, b, c, [2,1,-1]);
			else
				if(Brd[a[1]][b[1]][c[1]] === Brd[a[2]][b[2]][c[2]]) 	// 0AA -> X00
					Change(a, b, c, [4,-1,-1]);
				else 													// 0AB -> AB0
					Change(a, b, c, [1,2,-1]);
		else
			if(Brd[a[1]][b[1]][c[1]] === 0)
				if(Brd[a[0]][b[0]][c[0]] === Brd[a[2]][b[2]][c[2]]) 	// A0A -> X00
					Change(a, b, c, [3,1,-1]);
				else 													// A0B -> AB0
					Change(a, b, c, [0,2,-1]);
			else
				if(Brd[a[0]][b[0]][c[0]] === Brd[a[1]][b[1]][c[1]]) 	// AAB -> XB0
					Change(a, b, c, [3,2,-1]);
				else
					if(Brd[a[1]][b[1]][c[1]] === Brd[a[2]][b[2]][c[2]])	// ABB -> AX0
						Change(a, b, c, [0,3,-1]);
	}

	////////////////////////////////////////////////////////////////////////
	// Rotina que altera a matriz
	function Change
	(
		a,		// vetor correspondente à coordenada x
		b,		// vetor correspondente à coordenada y
		c,		// vetor correspondente à coordenada z
		p,		// ações correspondentes à posições 0, 1 e 2
	)
	{
		for(let i=0; i<3; i++)
		{
			switch(p[i])
			{
				case  i: break;
				case -1: Brd[a[i]][b[i]][c[i]] = 0; break;
				case  0: Brd[a[i]][b[i]][c[i]] = Brd[a[0]][b[0]][c[0]]; break;
				case  1: Brd[a[i]][b[i]][c[i]] = Brd[a[1]][b[1]][c[1]]; break;
				case  2: Brd[a[i]][b[i]][c[i]] = Brd[a[2]][b[2]][c[2]]; break;
				case  3: Brd[a[i]][b[i]][c[i]] ++; break;
				case  4: Brd[a[i]][b[i]][c[i]] = Brd[a[1]][b[1]][c[1]] + 1; break;
			}
		}
	}
