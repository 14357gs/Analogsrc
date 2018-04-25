let colors = {
	applications: {
		primary: '#a91d45',
		secondary: '#ba4a6b',
		tertiary: '#cc7890',
		quaternary: '#dda4b5'
	},
	brand: {
		primary: '#323232',
		secondary: '#636363',
		tertiary: '#ccc',
		quaternary: '#e5e5e5',
		quinary: '#f1f2f2'
	},
	community: {
		primary: '#27b34f',
		secondary: '#52c373',
		tertiary: '#7dd295',
		quaternary: '#a9e0b8',
		quinary: '#cfc'
	},
	'design center': {
		primary: '#ff7200',
		secondary: '#ff8f33',
		tertiary: '#ffab66',
		quaternary: '#ffc699 ',
		quinary: '#fff1e5'
	},
	education: {
		primary: '#7c4a8b',
		secondary: '#966ea2',
		tertiary: '#b092b9',
		quaternary: '#cab7d1',
		quinary: '#e3dbe8'
	},
	myAnalog: {
		primary: '#1e4056',
		secondary: '#335973',
		tertiary: '#668396',
		quaternary: '#99acb9',
		quinary: '#e1eaef'
	},
	parametric: {
		primary: '#656565',
		secondary: '#999',
		tertiary: '#ccc',
		quaternary: '#e5e5e5',
		quinary: '#f1f2f2'
	},
	products: {
		primary: '#009FBD',
		secondary: '#33B3CA',
		tertiary: '#66C5D7',
		quaternary: '#99d9e4',
		quinary: '#e5f5f8'
	},
	support: {
		primary: '#3ddce6',
		secondary: '#64e3eb',
		tertiary: '#8beaf0',
		quaternary: '#e1f7f8'
	},
	white: {
		primary: '#fff',
		secondary: 'f5f5f5'
	},
	black: {
		primary: '#000'
	},
	social: {
		facebook: '#3b5998',
        twitter: '#00aced',
        linkedin: '#007bb6',
        googlePlus: '#dd4b39',
        youtube: '#b00'
	}
};

/* generic names */
colors.aqua 			= colors.support;
colors.teal 			= colors.products;
colors[ 'dark gray' ]	= colors.brand;
colors[ 'light gray' ] 	= colors.parametric;
colors.green 			= colors.community;
colors.orange 			= colors[ 'design center' ];
colors.purple 			= colors.education;
colors.red 				= colors.applications;
colors.navy 			= colors.myAnalog;

export default colors;
