#include <cstdio>
#include <cstdlib>
#include <cstring>
#include "dll.h"

int main(int argc, char** argv) {
  if (argc != 4) {
    std::fprintf(stderr, "usage: dds-pilot <PBN deal> <dealer 0-3> <vulnerability 0-3>\n");
    return 2;
  }

  SetMaxThreads(0);
  ddTableDealPBN deal{};
  std::strncpy(deal.cards, argv[1], sizeof(deal.cards) - 1);
  ddTableResults table{};
  const int tableResult = CalcDDtablePBN(deal, &table);
  if (tableResult != RETURN_NO_FAULT) {
    char message[80]{};
    ErrorMessage(tableResult, message);
    std::fprintf(stderr, "CalcDDtablePBN: %s\n", message);
    return 3;
  }

  parResultsMaster par{};
  const int parResult = DealerParBin(&table, &par, std::atoi(argv[2]), std::atoi(argv[3]));
  if (parResult != RETURN_NO_FAULT) {
    char message[80]{};
    ErrorMessage(parResult, message);
    std::fprintf(stderr, "DealerParBin: %s\n", message);
    return 4;
  }

  std::printf("TABLE");
  for (int strain = 0; strain < DDS_STRAINS; ++strain) {
    for (int seat = 0; seat < DDS_HANDS; ++seat) {
      std::printf(" %d", table.resTable[strain][seat]);
    }
  }
  std::printf("\nPAR %d %d\n", par.score, par.number);
  for (int index = 0; index < par.number; ++index) {
    const contractType& contract = par.contracts[index];
    std::printf("CONTRACT %d %d %d %d %d\n",
      contract.underTricks,
      contract.overTricks,
      contract.level,
      contract.denom,
      contract.seats);
  }
  return 0;
}
