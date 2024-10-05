#include<iostream>
#include<ctime>
#include<vector>
#include<math.h>

using namespace std;

int main(){
    std::clock_t start = std::clock();
    long int n;
    cin>>n;
    if(n>3){ 
        std::vector<int> primes = {2, 3};
        long int no_of_primes = 2;
        
        for(long int i=5; i<=n; i = i+2){ 
            long int a = int(pow(i, 0.5));
            
            bool prime = true;
            for(long int j=0; primes[j]<=a; j++){
                if(i%primes[j]==0){
                    prime = false;
                    break;
                }
            }
            if(prime){
                primes.push_back(no_of_primes);
                primes[no_of_primes] = i;
                no_of_primes++;
                
            }

        }
        cout<<"there are "<<no_of_primes<<" primes less than or equal to "<<n<<endl;
        cout<<"they are ";
        for(long int i=0; i<(no_of_primes-1); i++){
            cout<<primes[i]<<",";
        }
        cout<<primes[no_of_primes-1]<<endl;
    }
    if(n==3){
        cout<<"There is only one prime less than 3 and that is '2'"<<endl;
    }
    if(n<3){
        cout<<"There are no primes less than "<<n<<endl;
    }
    std::clock_t end = std::clock();
    double run_time = 1000.0*(end-start)/CLOCKS_PER_SEC;
    cout<<"code executed in "<<run_time/1000.0<<" seconds"<<endl;
}