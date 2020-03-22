#include <vector>
#include <Eigen/Dense>
using namespace std;
using namespace Eigen;

class Body {
    public:
        bool hasMass;
        double m;
        Vector3d pos;
        Vector3d vel;
        Vector3d acc;

        Body(double px, double py, double pz, double vx, double vy, double vz, double mass);
};

void eulerSolver(vector<Body> bodies, int timesteps, double dt);

void rk4Solver(vector<Body> bodies, int timesteps, double dt);