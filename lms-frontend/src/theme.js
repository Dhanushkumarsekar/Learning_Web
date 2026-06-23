import { alpha, createTheme } from '@mui/material/styles';

const buildShadows = (isDark) => {
    const shadows = [
        'none',
        `0 2px 6px ${isDark ? 'rgba(2, 6, 23, 0.45)' : 'rgba(15, 23, 42, 0.10)'}`,
        `0 6px 16px ${isDark ? 'rgba(2, 6, 23, 0.52)' : 'rgba(15, 23, 42, 0.14)'}`,
        `0 12px 24px ${isDark ? 'rgba(2, 6, 23, 0.58)' : 'rgba(15, 23, 42, 0.16)'}`,
        `0 18px 36px ${isDark ? 'rgba(2, 6, 23, 0.62)' : 'rgba(15, 23, 42, 0.18)'}`,
    ];

    while (shadows.length < 25) {
        shadows.push(shadows[shadows.length - 1]);
    }

    return shadows;
};

const getPalette = (mode) => {
    if (mode === 'dark') {
        return {
            mode: 'dark',
            primary: {
                main: '#2dd4bf',
                light: '#5eead4',
                dark: '#14b8a6',
                contrastText: '#042f2e',
            },
            secondary: {
                main: '#fb923c',
                light: '#fdba74',
                dark: '#ea580c',
                contrastText: '#431407',
            },
            success: {
                main: '#34d399',
            },
            warning: {
                main: '#fbbf24',
            },
            error: {
                main: '#f87171',
            },
            info: {
                main: '#38bdf8',
            },
            background: {
                default: '#071724',
                paper: '#0f2233',
            },
            text: {
                primary: '#f8fafc',
                secondary: '#cbd5e1',
            },
            divider: alpha('#cbd5e1', 0.20),
        };
    }

    return {
        mode: 'light',
       primary: {
    main: '#312F90',
    light: '#4F46E5',
    dark: '#1E1B4B',
},
        secondary: {
            main: '#ea580c',
            light: '#fb923c',
            dark: '#c2410c',
            contrastText: '#fff7ed',
        },
        success: {
            main: '#10b981',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#dc2626',
        },
        info: {
            main: '#0284c7',
        },
       background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
},
        text: {
            primary: '#0f172a',
            secondary: '#475569',
        },
        divider: alpha('#0f172a', 0.10),
    };
};

const getTypography = () => ({
    fontFamily: '"Manrope", "Space Grotesk", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: { fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontSize: '2.15rem', fontWeight: 750, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontSize: '1.2rem', fontWeight: 650, letterSpacing: '-0.01em' },
    h6: { fontSize: '1.0rem', fontWeight: 650, letterSpacing: '-0.01em' },
    subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.55 },
    subtitle2: { fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '0.98rem', fontWeight: 500, lineHeight: 1.65 },
    body2: { fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
});

const getComponents = () => ({
    MuiCssBaseline: {
        styleOverrides: (theme) => ({
            '*': {
                boxSizing: 'border-box',
            },
            body: {
                margin: 0,
                minHeight: '100vh',
                color: theme.palette.text.primary,
                background:
                    theme.palette.mode === 'dark'
                        ? 'radial-gradient(circle at 0% 0%, rgba(45, 212, 191, 0.10), transparent 42%), radial-gradient(circle at 100% 0%, rgba(251, 146, 60, 0.10), transparent 46%), #071724'
                        :   'linear-gradient(180deg,#F8FAFC 0%,#FFFFFF 100%)',
                transition: 'background-color 240ms ease, color 240ms ease',
            },
            '#root': {
                minHeight: '100vh',
            },
            '::selection': {
                background: alpha(theme.palette.primary.main, 0.30),
            },
            '*::-webkit-scrollbar': {
                width: '10px',
                height: '10px',
            },
            '*::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.50),
                borderRadius: '999px',
            },
            '*::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.mode === 'dark' ? '#e2e8f0' : '#0f172a', 0.10),
            },
        }),
    },
    MuiAppBar: {
        styleOverrides: {
            root: ({ theme }) => ({
                background:
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(120deg, rgba(7, 23, 36, 0.94), rgba(11, 38, 52, 0.90))'
                        : 'linear-gradient(120deg, rgba(255, 255, 255, 0.90), rgba(236, 253, 250, 0.88))',
                color: theme.palette.text.primary,
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 2px 12px ${alpha(theme.palette.mode === 'dark' ? '#000000' : '#0f172a', 0.10)}`,
                borderRadius: 0,
            }),
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: ({ theme }) => ({
                background:
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(170deg, rgba(9, 27, 40, 0.96), rgba(11, 38, 52, 0.90))'
                        : 'linear-gradient(170deg, rgba(255, 255, 255, 0.97), rgba(236, 253, 250, 0.92))',
                borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                backdropFilter: 'blur(10px)',
                borderRadius: 0,
            }),
        },
    },
    MuiButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                minHeight: 40,
                borderRadius: 999,
                paddingInline: 18,
                transition: 'all 160ms ease',
                '&:hover': {
                    transform: 'translateY(-1px)',
                },
                '&:focus-visible': {
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
            }),
            contained: ({ theme }) => ({
                boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.28)}`,
                '&:hover': {
                    boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.34)}`,
                },
            }),
            outlined: ({ theme }) => ({
                borderWidth: 1.5,
                borderColor: alpha(theme.palette.primary.main, 0.45),
            }),
        },
    },
    MuiCard: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 18,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.11)}`,
                background:
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(160deg, rgba(15, 34, 51, 0.94), rgba(11, 38, 52, 0.86))'
                        : 'linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 250, 0.80))',
                boxShadow: `0 18px 42px ${alpha(theme.palette.mode === 'dark' ? '#000000' : '#0f172a', 0.18)}`,
            }),
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 16,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.10)}`,
                backgroundImage: 'none',
            }),
        },
    },
    MuiChip: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 999,
                fontWeight: 700,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.20)}`,
            }),
        },
    },
    MuiAvatar: {
        styleOverrides: {
            root: ({ theme }) => ({
                fontWeight: 700,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }),
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 14,
                marginBlock: 4,
                '&.Mui-selected': {
    backgroundColor: '#312F90',
    color: '#FFFFFF',

    '& .MuiListItemIcon-root': {
        color: '#FFFFFF',
    },

    '&:hover': {
        backgroundColor: '#4338CA',
    },
},
            }),
        },
    },
    MuiTextField: {
        defaultProps: {
            variant: 'outlined',
        },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 14,
                background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.34 : 0.88),
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.26),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.44),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                },
            }),
        },
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: ({ theme }) => ({
                borderRadius: 10,
                backgroundColor: alpha(theme.palette.mode === 'dark' ? '#0b2537' : '#082f49', 0.92),
                fontWeight: 600,
                fontSize: 12,
            }),
        },
    },
});

const buildTheme = (mode) =>
    createTheme({
        palette: getPalette(mode),
        typography: getTypography(),
        shape: {
            borderRadius: 14,
        },
        shadows: buildShadows(mode === 'dark'),
        components: getComponents(),
    });

const lightTheme = buildTheme('light');
const darkTheme = buildTheme('dark');

export function getTheme(mode = 'light') {
    return mode === 'dark' ? darkTheme : lightTheme;
}

export { lightTheme, darkTheme };
