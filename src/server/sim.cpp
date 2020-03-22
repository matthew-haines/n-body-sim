#include <iostream>
#include <vector>
#include <cmath>
#include <Eigen/Dense>
#include "sim.hpp"

double G = 6.67408e-11;
double mE = 5.9722e24;
double mM = 0.07346e24;

using namespace Eigen;
using namespace std;

Body::Body(double px, double py, double pz, double vx, double vy, double vz, double mass) {
    m = mass;
    pos << px, py, pz;
    vel << vx, vy, vz;
    hasMass = mass ? true : false;
    acc.setZero();
}

void eulerSolver(vector<Body> bodies, int timesteps, double dt) {
    for (int i = 0; i < timesteps; i++) {
        for (int j = 0; j < bodies.size(); j++) {
            for (int k = j + 1; k < bodies.size(); k++) {
                Vector3d r = bodies[j].pos - bodies[k].pos;
                Vector3d precursor = G/pow(r.norm(), 3) * r;
                if (bodies[k].hasMass) bodies[j].acc -= precursor * bodies[k].m;
                if (bodies[j].hasMass) bodies[k].acc += precursor * bodies[j].m;
            }
            bodies[j].vel += bodies[j].acc * dt;
            bodies[j].pos += bodies[j].vel * dt;
            //log something
            bodies[j].acc.setZero();
        }
    }
}

void rk4Solver(vector<Body> bodies, int timesteps, double dt) {
    
}