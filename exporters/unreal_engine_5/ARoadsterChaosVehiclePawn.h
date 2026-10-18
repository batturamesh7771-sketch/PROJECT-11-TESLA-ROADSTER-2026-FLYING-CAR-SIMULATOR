#pragma once

#include "CoreMinimal.h"
#include "WheeledVehiclePawn.h"
#include "ARoadsterChaosVehiclePawn.generated.h"

class UNiagaraComponent;

UCLASS()
class TESLAROADSTER_API ARoadsterChaosVehiclePawn : public AWheeledVehiclePawn
{
    GENERATED_BODY()

public:
    ARoadsterChaosVehiclePawn();

    virtual void Tick(float DeltaTime) override;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "SpaceX Propulsion")
    TArray<FName> ThrusterSocketNames;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "SpaceX Propulsion")
    TArray<float> InstantThrustValues; // 10 Nozzle thrust values in Newtons

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ground Effect")
    TArray<FName> FanSocketNames;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ground Effect")
    float TotalSuctionDownforceN;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ground Effect")
    bool bSuctionActive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visual Effects")
    UNiagaraComponent* NiagaraPlumeComponent;
};
