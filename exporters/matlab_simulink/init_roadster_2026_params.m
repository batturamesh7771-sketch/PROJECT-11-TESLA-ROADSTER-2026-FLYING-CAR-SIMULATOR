%% Tesla Roadster 2026 (Rocket Augment) - Parameters for MATLAB Vehicle Dynamics Blockset
clear; clc;

% Vehicle Mass & Inertias
m_dry = 2080.0; % kg
m_gas0 = 240.0; % kg (Rocket trim)
m_total = m_dry + m_gas0;

Ixx = 1029.0; % kg*m^2
Iyy = 2850.0; % kg*m^2
Izz = 3200.0; % kg*m^2

% Geometric Parameters
wheelbase = 2.75; % m
track_f = 1.68;   % m
track_r = 1.72;   % m
cg_height = 0.42; % m
cg_ratio = 0.46;  % 46% Front / 54% Rear

% Aerodynamics & Ground-Effect Suction
A_plenum = 4.00;    % m^2
P_fan_max = 80000;  % 80 kW
eta_fan = 0.60;
Cd_skirt = 0.60;
L_p = 13.0;         % m perimeter
F_suction_max = 46100; % N (4,700 kgf)

% COPV Thermodynamics & De Laval Thrusters
P0_initial = 379.2e5; % 379.2 bar (5,500 psi)
T0_initial = 293.15;  % K
V_tank = 0.60;        % m^3
gamma = 1.40;
R_spec = 296.8;       % J/(kg*K)
V_eff = 565.0;        % m/s

% 4 Rear Diffuser Nozzles
A_t_rear_total = 14.39e-4; % m^2

% Dual Rear SiC Electric Powertrain
P_motors_max = 1100e3; % 1.1 MW peak
T_motors_max = 1450;   % Nm
gear_ratio = 8.4;
tire_radius = 0.355;   % m (Pirelli P Zero Trofeo RS Elect)

fprintf('Tesla Roadster 2026 Parameters Initialized Successfully.\n');
