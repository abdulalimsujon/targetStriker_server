import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { HomeDataService } from './services/home-data.service';
import { TaskManagementService } from './services/task-management.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmployeeService } from './services/employee.service';
import { FilterWorkerDto } from './dto/filterWroker.dto';
import { WorkerDetailsService } from './services/worker-details.service';
import { IdDto } from 'src/common/dto/id.dto';
import { WorkerAssignedTaskDto } from './dto/workerAssignedTask.dto';
import { ReportAnalysesService } from './services/report-analyses.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly homeDataService: HomeDataService,
    private readonly taskManagementService: TaskManagementService,
    private readonly employeeService: EmployeeService,
    private readonly workerDetailsService: WorkerDetailsService,
    private readonly reportAnalysesService: ReportAnalysesService
  ) {}

  @Get('home-data')
  async getHomeData() {
    return await this.homeDataService.getHomeData();
  }

  @Get('task-management')
  async getServiceRequestsWithStatusLabel(
    @Query() PaginationDto: PaginationDto,
  ) {
    return await this.taskManagementService.getServiceRequestsWithStatusLabel(
      PaginationDto,
    );
  }

  @Get('employees')
  async getEmployees(@Query() PaginationDto: PaginationDto) {
    return await this.employeeService.getAllWorkerProfiles(PaginationDto);
  }

  @Get('search_or_filter_worker_profiles')
  async searchOrFilterWorkerProfiles(
    @Query() FilterWorkerDto: FilterWorkerDto,
  ) {
    return await this.employeeService.searOrFilterWorkerProfiles(
      FilterWorkerDto,
    );
  }

  @Get('worker-details')
  async getWorkerDetails(@Query() id: IdDto) {
    return await this.workerDetailsService.getWorkerDetails(id);
  }

  @Get('worker/assigned/task')
  async getWorkerAssignedTask(@Query() data: WorkerAssignedTaskDto) {
    return await this.taskManagementService.getServiceRequestsWithStatusLabel(
      {
        skip: data.skip,
        take: data.take,
      },
      { id: data.workerId },
    );
  }

  @Get('report-analyses')
  async getReportAnalyses() {
    return await this.reportAnalysesService.getReport();
  }

}
