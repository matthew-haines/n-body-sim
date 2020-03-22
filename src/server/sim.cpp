#include <iostream>
#include <vector>
#include <cmath>
#include <fstream>
#include <string>
#include <Eigen/Dense>

double G = 6.67408e-11;
double mE = 5.9722e24;
double mM = 0.07346e24;

using namespace Eigen;
using namespace std;

class Body {
    public:
        bool hasMass;
        double m;
        Vector3d pos;
        Vector3d vel;
        Vector3d acc;
    
        Body(double px, double py, double pz, double vx, double vy, double vz, double mass) {
            m = mass;
            pos << px, py, pz;
            vel << vx, vy, vz;
            hasMass = mass ? true : false;
            acc.setZero();
        };
};

void eulerSolver(vector<Body> bodies, int timesteps, double dt, ofstream* file) {
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
            *file << bodies[j].pos(0) << ' ' << bodies[j].pos(1) << ' ' << bodies[j].pos(2) << ' ';
            bodies[j].acc.setZero();
        }
        *file << '\n';
    }
}

void rk4Solver(vector<Body> bodies, int timesteps, double dt, ofstream* file) {
    
}

int main(int argc, char* argv[]) {
    if (argc != 3) return 1;
    ifstream inFile(argv[1]);
    vector<Body> bodies;
    // file in format line by line x y z vx vy vz m
    // first line is timesteps dt
    int timesteps;
    double dt;
    inFile >> timesteps >> dt;

    double px, py, pz, vx, vy, vz, m;
    while (inFile >> px >> py >> pz >> vx >> vy >> vz >> m) {
        bodies.push_back(Body(px, py, pz, vx, vy, vz, m));
        cout << px << py << pz << vx << vy << vz << m << endl;
    }
    inFile.close();

    ofstream file;
    file.open("output.txt");
    eulerSolver(bodies, timesteps, dt, &file);
    file.close();
    return 0;
}