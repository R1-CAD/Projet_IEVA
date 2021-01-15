
// ======================================================================================================================
// Spécialisation des classes Sim et Acteur pour un projet particulier
// ======================================================================================================================

function Appli(){
	Sim.call(this) ; 
}

Appli.prototype = Object.create(Sim.prototype) ; 
Appli.prototype.constructor = Appli ; 

Appli.prototype.creerScene = function(params){
	params = params || {} ; 
	this.scene.add(new THREE.AxesHelper(3.0)) ; 
	this.scene.add(creerSol()) ;

	// Placement de pinguoins (ici 9)
	
	for (let i = 0; i < 9; i++) {
		var ping_num = "tux" + i;
  		var tux = new ActeurAlea(ping_num,{path:"assets/obj/pingouin",obj:"penguin",mtl:"penguin"},this);
		tux.setPosition(getRandomInt(50),0,getRandomInt(50));
		this.addActeur(tux);
	}

	// Placement aléatoire d'herbe sur le terrain
	for (let i = 0; i < 66; i++) {
		var herbe_num = "herbe" + i;
  		var herbe = new Herbe(herbe_num,{},this);
		herbe.setPosition(getRandomInt(50),0,getRandomInt(50));
		this.addActeur(herbe);
	}

	var rocher = new Rocher("rocher",{largeur:3,profondeur:2,hauteur:1.5,couleur:0xffaa22},this);
	rocher.setPosition(-5,0.75,5) ; 
	this.addActeur(rocher) ; 
}

// ========================================================================================================

// Fonctions supplémentaires
// Random
function getRandomInt(max) {
	return Math.floor((Math.random() * (max*2)) - max);
}

// ========================================================================================================

// Acteur1

function Acteur1(nom,data,sim){
	Acteur.call(this,nom,data,sim) ; 

	var repertoire = data.path + "/" ; 
	var fObj       = data.obj + ".obj" ; 
	var fMtl       = data.mtl + ".mtl" ; 

	var obj = chargerObj("tux1",repertoire,fObj,fMtl) ; 
	this.setObjet3d(obj) ; 
}

Acteur1.prototype = Object.create(Acteur.prototype) ; 
Acteur1.prototype.constructor = Acteur1 ; 

Acteur1.prototype.actualiser = function(dt){
	console.log(this.sim.horloge) ; 
	var t = this.sim.horloge  ; 
	this.setOrientation(t) ;  
	this.setPosition(2*Math.sin(t),0.0,3*Math.cos(2*t)) ; 
}


// ActeurAlea
function ActeurAlea(nom,data,sim){

	Acteur.call(this,nom,data,sim, new Nimbus(this,30)) ; 

	var repertoire = data.path + "/" ; 
	var fObj       = data.obj + ".obj" ; 
	var fMtl       = data.mtl + ".mtl" ; 

	var obj = chargerObj("tux1",repertoire,fObj,fMtl) ; 
	this.setObjet3d(obj) ; 

	this.addComposant(new RegardPing(this,{}));
	this.addComposant(new CompAlea(this,{}));
	this.addComposant(new CompFrott(this,{}));
	this.addComposant(new AllerVersPing(this,{}));
	this.addComposant(new FuirCamera(this,{}));
	this.addComposant(new AllerVersHerbe(this,{}));
	this.addComposant(new ConsoHerbe(this,{}));
	
}

ActeurAlea.prototype = Object.create(Acteur.prototype) ; 
ActeurAlea.prototype.constructor = ActeurAlea ; 

ActeurAlea.prototype.actualiser = function(dt){
	var t = this.sim.horloge;

	// Limite de la map
	if(this.objet3d.position.x>50.0) this.objet3d.position.x=50.0;
    if(this.objet3d.position.z>50.0) this.objet3d.position.z=50.0;
    if(this.objet3d.position.x<-50.0) this.objet3d.position.x=-50.0;
    if(this.objet3d.position.z<-50.0) this.objet3d.position.z=-50.0;

	this.objet3d.position.addScaledVector(this.vitesse, dt);
	this.vitesse.addScaledVector(this.acceleration, dt);
	this.acceleration.set(0.0,0.0,0.0);

	//console.log(this.sim.controleur.position);
}


// La classe décrivant les touffes d'herbe
// =======================================

function Herbe(nom,data,sim){

	Acteur.call(this,nom,data,sim,new Nimbus(this,5)) ; 

	var rayon   = data.rayon || 0.25 ;  
	var couleur = data.couleur || 0x00ff00 ;  

	var sph = creerSphere(nom,{rayon:rayon, couleur:couleur}) ;
	this.setObjet3d(sph) ; 
}
Herbe.prototype = Object.create(Acteur.prototype) ; 
Herbe.prototype.constructor = Herbe ; 

// La classe décrivant les rochers
// ===============================

function Rocher(nom,data,sim){
	Acteur.call(this,nom,data,sim) ; 

	var l = data.largeur || 0.25 ;  
	var h = data.hauteur || 1.0 ; 
	var p = data.profondeur || 0.5 ;  
	var couleur = data.couleur || 0x00ff00 ;  

	var box = creerBoite(nom,{largeur:l, hauteur:h, profondeur:p, couleur:couleur}) ;
	this.setObjet3d(box) ; 
}
Rocher.prototype = Object.create(Acteur.prototype) ; 
Rocher.prototype.constructor = Rocher ; 

// ===============================================================================================
// --- Ajout de Composants

// Regard de l'acteur
function RegardPing(entite, opts){
	Composant.call(this,entite);
	this.regard = new THREE.Vector3(0.0,0.0,0.0);
}

RegardPing.prototype = Object.create(Composant.prototype);
RegardPing.prototype.constructor = RegardPing;
RegardPing.prototype.actualiser = function(dt){
	this.regard.copy(this.entite.getPosition());
	this.regard.addScaledVector(this.entite.vitesse,1.0);
	this.entite.objet3d.lookAt(this.regard);
}

// Composant de déplacement aléatoire
function CompAlea(entite, opts){
	Composant.call(this,entite) ;
	this.force = new THREE.Vector3(0.0,0.0,0.0);
	this.alea = opts.alea || 0.5;
}

CompAlea.prototype = Object.create(Composant.prototype) ;
CompAlea.prototype.constructor = CompAlea ;
CompAlea.prototype.actualiser = function(dt){

	if(Math.random()<this.alea){
		var rand_x = (Math.random()-0.5);
		var rand_z = (Math.random()-0.5);
		this.force = new THREE.Vector3(rand_x, 0.0, rand_z);
		this.force.normalize();
		this.force.multiplyScalar(3);
		this.entite.applyForce(this.force);
	}
}

// Composant de frottement
function CompFrott(entite, opts){
	Composant.call(this,entite) ;
	this.force = new THREE.Vector3(0.0,0.0,0.0) ;
	this.k = opts.k || 0.1 ;
}

CompFrott.prototype = Object.create(Composant.prototype) ;
CompFrott.prototype.constructor = CompFrott ;
CompFrott.prototype.actualiser = function(dt){
	this.force.copy(this.entite.vitesse) ;
	this.force.multiplyScalar(-this.k) ;
	this.entite.applyForce(this.force) ;
}

// Composant d'attirance des autres pinguoins
function AllerVersPing(entite,opts){
	Composant.call(this,entite);
	this.distMin = 2;
	this.attirance = 5;
}

AllerVersPing.prototype = Object.create(Composant.prototype);
AllerVersPing.prototype.constructor = AllerVersPing;
AllerVersPing.prototype.actualiser = function(dt){
	if(this.entite){
		var les_acteurs = this.entite.sim.acteurs;
		var nb_acteurs = les_acteurs.length;
		for(var i=0; i<nb_acteurs; i++){
			if(les_acteurs[i] instanceof ActeurAlea){
				var trajectoire = new THREE.Vector3();
				var distToPing = les_acteurs[i].getPosition().distanceTo(this.entite.getPosition());
				if(distToPing > this.distMin){
					trajectoire.subVectors(les_acteurs[i].getPosition(), this.entite.getPosition());
				} else {
					trajectoire.subVectors(this.entite.getPosition(),les_acteurs[i].getPosition());
				}
				trajectoire.normalize();
				// Rencontrant un problème avec distToPing dans le multiplyScalar,
				// on fixe la distance selon que l'acteur est plus ou moins proche
				if(distToPing < 2){
					distToPing = 2;
				}
				if(distToPing > 60){
					distToPing = 60;
				}
				trajectoire.multiplyScalar(this.attirance/(Math.pow(distToPing,2)));
				this.entite.applyForce(trajectoire);
			}
		}
	}
}


// Composant de fuite
function FuirCamera(entite,opts){
	Composant.call(this,entite);
}

FuirCamera.prototype = Object.create(Composant.prototype);
FuirCamera.prototype.constructor = FuirCamera;
FuirCamera.prototype.actualiser = function(dt){
	if(this.entite){
		var trajectoire = new THREE.Vector3();
		var posCam = new THREE.Vector3(this.entite.sim.controleur.position.x,0,this.entite.sim.controleur.position.z)
		var distToCam = this.entite.getPosition().distanceTo(posCam);
		if(distToCam < 3){
			trajectoire.subVectors(this.entite.getPosition(),posCam);
		}
		trajectoire.normalize();
		trajectoire.multiplyScalar(1/(Math.pow(distToCam,2)));
		this.entite.applyForce(trajectoire);
	}
}


// Composant d'attirance de l'herbe
function AllerVersHerbe(entite,opts){
	Composant.call(this,entite);
}

AllerVersHerbe.prototype = Object.create(Composant.prototype);
AllerVersHerbe.prototype.constructor = AllerVersHerbe;
AllerVersHerbe.prototype.actualiser = function(dt){
	if(this.entite){
		var les_acteurs = this.entite.sim.acteurs;
		var nb_acteurs = les_acteurs.length;
		for(var i=0; i<nb_acteurs; i++){
			if(les_acteurs[i] instanceof Herbe){
				if(les_acteurs[i].nimbus.isInNimbus(this.entite.getPosition())){

					var trajectoire = new THREE.Vector3();
					var distToHerbe = les_acteurs[i].getPosition().distanceTo(this.entite.getPosition());
					trajectoire.subVectors(les_acteurs[i].getPosition(), this.entite.getPosition());
					trajectoire.normalize();
					trajectoire.multiplyScalar(1/(Math.pow(distToHerbe,2)));
					this.entite.applyForce(trajectoire);

				}
			}
		}
	}
}

// Composant pour que le pinguoin mange de l'herbe
function ConsoHerbe(entite,opts){
	Composant.call(this,entite);
}

ConsoHerbe.prototype = Object.create(Composant.prototype);
ConsoHerbe.prototype.constructor = ConsoHerbe;
ConsoHerbe.prototype.actualiser = function(dt){
	if(this.entite){
		var les_acteurs = this.entite.sim.acteurs;
		var nb_acteurs = les_acteurs.length;
		for(var i=0; i<nb_acteurs; i++){
			if((les_acteurs[i] instanceof Herbe) && (les_acteurs[i].getPosition().distanceTo(this.entite.getPosition()) < 0.75)){
				les_acteurs[i].setPosition(1000,0,1000);
			}
		}
	}
}
