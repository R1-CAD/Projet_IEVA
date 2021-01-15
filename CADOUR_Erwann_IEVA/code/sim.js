
// ============================================================================================
// Les deux classes de base : Sim et Acteur
//
// Une instance de Sim fait évoluer l'état des instances de la classe Acteur
// et les restitue
// ===========================================================================================


function Sim(){
	this.renderer   = null ; 
	this.scene      = null ;
	this.camera     = null ; 
	this.controleur = null ; 
	this.horloge    = 0.0 ; 
	this.chrono     = null ; 
	this.acteurs    = [] ; 

	this.textureLoader = new THREE.TextureLoader() ; 
}

Sim.prototype.init = function(params){
	params = params || {} ; 
	var scn = new THREE.Scene() ; 
	var rd  = new THREE.WebGLRenderer({antialias:true, alpha:true}) ;
	rd.setSize(window.innerWidth, window.innerHeight) ; 
	document.body.appendChild(rd.domElement) ; 
	var cam = new THREE.PerspectiveCamera(45.0,window.innerWidth/window.innerHeight,0.1,1000.0) ; 
	cam.position.set(5.0,1.7,5.0) ; 
	this.controleur = new ControleurCamera(cam) ; 

	var that = this ; 
	window.addEventListener(
			'resize',
			function(){
				that.camera.aspect = window.innerWidth / window.innerHeight ;
				that.camera.updateProjectionMatrix() ; 
				that.renderer.setSize(window.innerWidth, window.innerHeight) ; 
				  }
				) ; 

	// Affectation de callbacks aux événements utilisateur
	document.addEventListener("keyup",    function(e){that.controleur.keyUp(e);}    ,false) ; 
	document.addEventListener("keydown",  function(e){that.controleur.keyDown(e);}  ,false) ;
	document.addEventListener("mousemove",function(e){that.controleur.mouseMove(e);},false) ;
	document.addEventListener("mousedown",function(e){that.controleur.mouseDown(e);},false) ;

	scn.add(new THREE.AmbientLight(0xffffff,1.0)) ;
	scn.add(new THREE.GridHelper(100,20)) ; 

	this.scene    = scn ; 
	this.camera   = cam ;
	this.renderer = rd ;    

	this.creerScene() ; 

	this.chrono   = new THREE.Clock() ; 
	this.chrono.start() ; 

}

// Méthode de création du contenu du monde : à surcharger
// ======================================================

Sim.prototype.creerScene = function(params){}

// Boucle de simulation
// ====================

Sim.prototype.actualiser = function(dt){

	var that     = this ; 

	var dt       = this.chrono.getDelta() ; 
	this.horloge += dt ;

	// Modification de la caméra virtuelle
	// ===================================

	this.controleur.update(dt) ; 

	// Boucle ACTION
	// =============

	var n = this.acteurs.length ;

	// Actualisation des composants des acteurs
	for(var i=0; i<n; i++){
		var n_c = this.acteurs[i].composants.length;
		for(var j=0; j<n_c; j++){
			this.acteurs[i].composants[j].actualiser(dt);
		};
	};

	// Actualisation des acteurs
	for(var i=0; i<n; i++){
		this.acteurs[i].actualiser(dt) ; 
	} ;

	this.renderer.render(this.scene,this.camera) ; 

	requestAnimationFrame(function(){that.actualiser();}) ; 
}

Sim.prototype.addActeur = function(act){
	this.acteurs.push(act) ;
} 

// ===============================================================================================
// --- Nimbus 
function Nimbus(actor,rayon){
	this.entite = actor;
	this.rayon = rayon;
}

Nimbus.prototype = Object.create(Nimbus.prototype);
Nimbus.prototype.constructor = Nimbus;
Nimbus.prototype.isInNimbus = function(posCible){
	var CibleDist = this.entite.objet3d.position.distanceTo(posCible);
	if(CibleDist < this.rayon){
		return true;
	} else {
		return false;
	}
}

// ===============================================================================================
// --- Acteur

// Acteur modifié pour avoir un nimbus
function Acteur(nom, data, sim, nimbus){
	this.nom = nom ; 
	this.objet3d = null ; 
	this.sim = sim ; 
	// Ajout d'une masse à un acteur
	this.masse = 1.0;
	// Ajout de la vitesse et de l'accelération à un acteur
	this.vitesse = new THREE.Vector3();
	this.acceleration = new THREE.Vector3();
	// Ajout d'une liste de composants à un acteur
	this.composants = [];
	// Ajout d'un nimbus à un acteur
	this.nimbus = nimbus;
}

// Affectation d'une incarnation à un acteur
Acteur.prototype.setObjet3d = function(obj){
	this.objet3d = obj ; 
	this.sim.scene.add(this.objet3d) ; 
}

// Modification de la position de l'acteur
Acteur.prototype.setPosition = function(x,y,z){
	if(this.objet3d){
		this.objet3d.position.set(x,y,z) ; 
	}
}

// Récupération de la position de l'acteur
Acteur.prototype.getPosition = function(){
	if (this.objet3d){
		return this.objet3d.position;
	}
}

// Modification de l'orientation de l'acteur
Acteur.prototype.setOrientation = function(cap){
	if(this.objet3d){
		this.objet3d.rotation.y = cap ; 
	}
}

// Récupération de l'orientation de l'acteur
Acteur.prototype.getOrientation = function(){
	if(this.objet3d){
		return this.objet3d.rotation.y;
	}
}

//Application d'une force
Acteur.prototype.applyForce = function(f){
	this.acceleration.addScaledVector(f, 1.0/this.masse);
}

// Modification de la visibilité de l'acteur
Acteur.prototype.setVisible = function(v){
	if(this.objet3d){
		this.objet3d.isVisible = v ;
	}
}

Acteur.prototype.addComposant = function(c) {
	this.composants.push(c);
}

Acteur.prototype.actualiser = function(dt){}

// ===============================================================================================
// --- Composants 
function Composant(entite){
	this.entite = entite ;
}

Composant.prototype.actualiser = function(dt){}
	 
