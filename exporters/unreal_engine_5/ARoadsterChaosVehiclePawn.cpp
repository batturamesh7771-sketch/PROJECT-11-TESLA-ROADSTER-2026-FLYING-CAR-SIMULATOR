#include "ARoadsterChaosVehiclePawn.h"
#include "ChaosWheeledVehicleMovementComponent.h"
#include "Components/PrimitiveComponent.h"
#include "NiagaraComponent.h"

ARoadsterChaosVehiclePawn::ARoadsterChaosVehiclePawn()
{
    PrimaryActorTick.bCanEverTick = true;

    ThrusterSocketNames = {
        TEXT("Socket_CGT_R1"), TEXT("Socket_CGT_R2"), TEXT("Socket_CGT_R3"), TEXT("Socket_CGT_R4"),
        TEXT("Socket_CGT_W1"), TEXT("Socket_CGT_W2"), TEXT("Socket_CGT_W3"), TEXT("Socket_CGT_W4"),
        TEXT("Socket_CGT_N1"), TEXT("Socket_CGT_N2")
    };

    FanSocketNames = {
        TEXT("Socket_Fan_1"), TEXT("Socket_Fan_2"), TEXT("Socket_Fan_3"), TEXT("Socket_Fan_4")
    };

    InstantThrustValues.Init(0.0f, 10);
    TotalSuctionDownforceN = 46100.0f;
    bSuctionActive = true;
}

void ARoadsterChaosVehiclePawn::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    UPrimitiveComponent* MeshComp = Cast<UPrimitiveComponent>(GetRootComponent());
    if (!MeshComp) return;

    // 1. Apply Thruster Forces across Sockets
    for (int32 i = 0; i < ThrusterSocketNames.Num(); i++)
    {
        if (InstantThrustValues[i] > 10.0f)
        {
            FVector SocketLoc = MeshComp->GetSocketLocation(ThrusterSocketNames[i]);
            FVector SocketForward = MeshComp->GetSocketRotation(ThrusterSocketNames[i]).Vector();
            FVector ForceVec = SocketForward * (InstantThrustValues[i] * 100.0f); // UE units (cm*g/s^2)
            MeshComp->AddForceAtLocation(ForceVec, SocketLoc);
        }
    }

    // 2. Apply Ground Effect Vacuum Suction
    if (bSuctionActive && TotalSuctionDownforceN > 100.0f)
    {
        FVector DownVector = -GetActorUpVector();
        float ForcePerFan = (TotalSuctionDownforceN * 100.0f) / 4.0f;

        for (const FName& SocketName : FanSocketNames)
        {
            FVector FanLoc = MeshComp->GetSocketLocation(SocketName);
            MeshComp->AddForceAtLocation(DownVector * ForcePerFan, FanLoc);
        }
    }
}
